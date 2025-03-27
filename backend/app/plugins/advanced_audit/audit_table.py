# app/plugins/advanced_audit/audit_table.py

from typing import List, Optional, Dict, Any, Type, Callable
from sqlalchemy import event
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import DeclarativeMeta
from .models import AuditLog
from .schemas import AuditLogCreate
import json

class TableAuditor:
    """
    Classe utilitaire pour faciliter l'audit des modifications sur des tables spécifiques.
    Elle permet de tracer automatiquement les opérations CREATE, UPDATE et DELETE sur les tables configurées.
    """
    
    def __init__(self, db_session_factory: Callable[[], Session]):
        """
        Initialise l'auditeur de table avec une fonction de création de session de base de données.
        
        Args:
            db_session_factory: Fonction qui retourne une nouvelle session de base de données
        """
        self.db_session_factory = db_session_factory
        self.registered_models = {}
        
    def register_model(self, model: Type[DeclarativeMeta], primary_key: str = 'id', 
                      excluded_columns: List[str] = None, included_columns: List[str] = None,
                      resource_name: str = None):
        """
        Enregistre un modèle pour l'audit.
        
        Args:
            model: Le modèle SQLAlchemy à auditer
            primary_key: Le nom de la colonne de clé primaire (par défaut 'id')
            excluded_columns: Colonnes à exclure de l'audit
            included_columns: Si fourni, seules ces colonnes seront auditées
            resource_name: Nom personnalisé pour la ressource dans les logs d'audit
        """
        if excluded_columns is None:
            excluded_columns = []
            
        # Exclure les colonnes sensibles par défaut
        for col in ['password', 'password_hash', 'token', 'secret', 'key']:
            if col not in excluded_columns:
                excluded_columns.append(col)
                
        model_name = resource_name or model.__tablename__
        
        self.registered_models[model.__name__] = {
            'model': model,
            'primary_key': primary_key,
            'excluded_columns': excluded_columns,
            'included_columns': included_columns,
            'resource_name': model_name
        }
        
        # Enregistrer les événements SQLAlchemy pour ce modèle
        self._register_events(model)
        
        print(f"Audit enabled for model: {model.__name__} as resource '{model_name}'")
        
    def _register_events(self, model: Type[DeclarativeMeta]):
        """
        Enregistre les événements SQLAlchemy pour un modèle.
        """
        # Événement après insertion (CREATE)
        event.listen(model, 'after_insert', self._after_insert)
        
        # Événement après mise à jour (UPDATE)
        event.listen(model, 'after_update', self._after_update)
        
        # Événement après suppression (DELETE)
        event.listen(model, 'after_delete', self._after_delete)
        
    def _create_audit_log(self, action: str, resource: str, details: Optional[str] = None,
                         user_id: Optional[int] = None):
        """
        Crée une entrée de journal d'audit.
        """
        try:
            # Créer une nouvelle session
            db = self.db_session_factory()
            
            # Créer l'entrée d'audit
            audit_data = AuditLogCreate(
                user_id=user_id,
                action=action,
                resource=resource,
                details=details
            )
            
            log = AuditLog(
                user_id=audit_data.user_id,
                action=audit_data.action,
                resource=audit_data.resource,
                details=audit_data.details
            )
            
            db.add(log)
            db.commit()
            
        except Exception as e:
            print(f"Erreur lors de la création du log d'audit: {str(e)}")
            if db:
                db.rollback()
        finally:
            if db:
                db.close()
    
    def _get_model_config(self, model_instance):
        """
        Récupère la configuration d'audit pour une instance de modèle.
        """
        model_name = model_instance.__class__.__name__
        return self.registered_models.get(model_name)
    
    def _get_object_data(self, obj, config: Dict):
        """
        Extrait les données pertinentes d'un objet en fonction de la configuration.
        """
        data = {}
        
        # Si included_columns est spécifié, n'inclure que ces colonnes
        include_list = config.get('included_columns')
        exclude_list = config.get('excluded_columns', [])
        
        for column in obj.__table__.columns:
            column_name = column.name
            
            # Vérifier si la colonne doit être incluse
            if include_list is not None and column_name not in include_list:
                continue
                
            # Vérifier si la colonne doit être exclue
            if column_name in exclude_list:
                continue
                
            # Ajouter la valeur à l'objet de données
            try:
                value = getattr(obj, column_name)
                
                # Conversion des types complexes en chaînes
                if hasattr(value, '__dict__'):
                    data[column_name] = str(value)
                else:
                    data[column_name] = value
            except:
                data[column_name] = "ERROR: Could not retrieve value"
        
        return data
    
    def _after_insert(self, mapper, connection, target):
        """
        Gestionnaire d'événement après insertion.
        """
        config = self._get_model_config(target)
        if not config:
            return
            
        # Extraire l'ID de l'objet
        primary_key = config['primary_key']
        object_id = getattr(target, primary_key)
        
        # Récupérer les données de l'objet
        data = self._get_object_data(target, config)
        
        # Créer le détail du journal d'audit
        details = json.dumps({
            'id': object_id,
            'data': data
        })
        
        # Créer le journal d'audit
        self._create_audit_log(
            action='CREATE',
            resource=config['resource_name'],
            details=details
        )
    
    def _after_update(self, mapper, connection, target):
        """
        Gestionnaire d'événement après mise à jour.
        """
        config = self._get_model_config(target)
        if not config:
            return
            
        # Extraire l'ID de l'objet
        primary_key = config['primary_key']
        object_id = getattr(target, primary_key)
        
        # Récupérer les changements de l'objet (si disponible via SQLAlchemy history)
        changes = {}
        for attr in target.__mapper__.attrs:
            if hasattr(attr.history, 'has_changes') and attr.history.has_changes():
                changes[attr.key] = {
                    'old': attr.history.deleted[0] if attr.history.deleted else None,
                    'new': attr.history.added[0] if attr.history.added else None
                }
        
        # Si aucun changement n'est détecté, récupérer toutes les données
        if not changes:
            changes = self._get_object_data(target, config)
        
        # Créer le détail du journal d'audit
        details = json.dumps({
            'id': object_id,
            'changes': changes
        })
        
        # Créer le journal d'audit
        self._create_audit_log(
            action='UPDATE',
            resource=config['resource_name'],
            details=details
        )
    
    def _after_delete(self, mapper, connection, target):
        """
        Gestionnaire d'événement après suppression.
        """
        config = self._get_model_config(target)
        if not config:
            return
            
        # Extraire l'ID de l'objet
        primary_key = config['primary_key']
        object_id = getattr(target, primary_key)
        
        # Récupérer les données de l'objet avant suppression
        data = self._get_object_data(target, config)
        
        # Créer le détail du journal d'audit
        details = json.dumps({
            'id': object_id,
            'data': data
        })
        
        # Créer le journal d'audit
        self._create_audit_log(
            action='DELETE',
            resource=config['resource_name'],
            details=details
        )
        
    def manually_log(self, action: str, resource: str, object_id: Any, data: Dict = None, 
                    user_id: Optional[int] = None):
        """
        Fonction utilitaire pour créer manuellement un journal d'audit.
        
        Args:
            action: Action effectuée (ex: 'VIEW', 'EXPORT', 'CUSTOM_ACTION')
            resource: Nom de la ressource
            object_id: ID de l'objet concerné
            data: Données supplémentaires à journaliser
            user_id: ID de l'utilisateur qui a effectué l'action
        """
        details = json.dumps({
            'id': object_id,
            'data': data or {}
        })
        
        self._create_audit_log(
            action=action,
            resource=resource,
            details=details,
            user_id=user_id
        )
