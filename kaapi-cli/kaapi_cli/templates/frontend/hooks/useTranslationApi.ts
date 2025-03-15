import { useState } from 'react';

// Type definitions
export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flagCode?: string;
  isRtl: boolean;
  isDefault: boolean;
  isEnabled: boolean;
}

export interface TranslationGroup {
  id: number;
  name: string;
  description?: string;
}

export interface Translation {
  id: number;
  key: string;
  value: string;
  language: Language;
  group: TranslationGroup;
  context?: string;
  pluralForms?: PluralForm[];
  isMachineTranslated: boolean;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PluralForm {
  quantity: string;
  value: string;
}

export interface TranslationHistory {
  id: number;
  translationId: number;
  oldValue?: string;
  newValue: string;
  userId?: number;
  userName?: string;
  createdAt: string;
}

export interface LanguageStats {
  totalKeys: number;
  translatedKeys: number;
  missingKeys: number;
  needsReview: number;
  completionPercentage: number;
}

// Hook implementation
export const useTranslationApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = '/api/plugins/advanced-i18n';

  // Helper method for API calls
  const fetchApi = async (endpoint: string, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An error occurred');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Language related methods
  const getLanguages = async () => {
    return fetchApi('/languages');
  };

  const getLanguage = async (id: number) => {
    return fetchApi(`/languages/${id}`);
  };

  const createLanguage = async (languageData: Partial<Language>) => {
    return fetchApi('/languages', {
      method: 'POST',
      body: JSON.stringify(languageData),
    });
  };

  const updateLanguage = async (id: number, languageData: Partial<Language>) => {
    return fetchApi(`/languages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(languageData),
    });
  };

  const deleteLanguage = async (id: number) => {
    return fetchApi(`/languages/${id}`, {
      method: 'DELETE',
    });
  };

  const setDefaultLanguage = async (id: number) => {
    return fetchApi(`/languages/${id}/set-default`, {
      method: 'POST',
    });
  };

  const toggleLanguageEnabled = async (id: number, isEnabled: boolean) => {
    return fetchApi(`/languages/${id}/toggle-enabled`, {
      method: 'POST',
      body: JSON.stringify({ isEnabled }),
    });
  };

  const getLanguageStats = async (id: number) => {
    return fetchApi(`/languages/${id}/stats`);
  };

  // Translation group related methods
  const getGroups = async () => {
    return fetchApi('/groups');
  };

  const getGroup = async (id: number) => {
    return fetchApi(`/groups/${id}`);
  };

  const createGroup = async (groupData: Partial<TranslationGroup>) => {
    return fetchApi('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  };

  const updateGroup = async (id: number, groupData: Partial<TranslationGroup>) => {
    return fetchApi(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  };

  const deleteGroup = async (id: number) => {
    return fetchApi(`/groups/${id}`, {
      method: 'DELETE',
    });
  };

  // Translation related methods
  const getTranslations = async (params: any = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.languageCode) queryParams.append('language_code', params.languageCode);
    if (params.groupName) queryParams.append('group_name', params.groupName);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.perPage) queryParams.append('per_page', params.perPage.toString());
    if (params.needsReview !== undefined) queryParams.append('needs_review', params.needsReview.toString());
    
    const queryString = queryParams.toString();
    return fetchApi(`/translations${queryString ? `?${queryString}` : ''}`);
  };

  const getTranslation = async (id: number) => {
    return fetchApi(`/translations/${id}`);
  };

  const createTranslation = async (translationData: any) => {
    return fetchApi('/translations', {
      method: 'POST',
      body: JSON.stringify(translationData),
    });
  };

  const updateTranslation = async (id: number, translationData: any) => {
    return fetchApi(`/translations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(translationData),
    });
  };

  const deleteTranslation = async (id: number) => {
    return fetchApi(`/translations/${id}`, {
      method: 'DELETE',
    });
  };

  const getTranslationHistory = async (translationId: number) => {
    return fetchApi(`/translations/${translationId}/history`);
  };

  // Import/Export methods
  const importTranslations = async (file: File, options: any = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.languageCode) formData.append('language_code', options.languageCode);
    if (options.groupName) formData.append('group_name', options.groupName);
    if (options.overwrite !== undefined) formData.append('overwrite', options.overwrite.toString());
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/import`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Import failed');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const exportTranslations = async (format: 'json' | 'csv' | 'xlsx', options: any = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (options.languageCode) queryParams.append('language_code', options.languageCode);
    if (options.groupName) queryParams.append('group_name', options.groupName);
    
    window.location.href = `${API_URL}/export?${queryParams.toString()}`;
    return true;
  };

  // Machine translation
  const machineTranslate = async (translationId: number, targetLanguageCode: string) => {
    return fetchApi(`/translations/${translationId}/machine-translate`, {
      method: 'POST',
      body: JSON.stringify({ targetLanguageCode }),
    });
  };

  // Return all methods and state
  return {
    isLoading,
    error,
    
    // Languages
    getLanguages,
    getLanguage,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    setDefaultLanguage,
    toggleLanguageEnabled,
    getLanguageStats,
    
    // Groups
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    
    // Translations
    getTranslations,
    getTranslation,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    getTranslationHistory,
    
    // Import/Export
    importTranslations,
    exportTranslations,
    
    // Machine translation
    machineTranslate,
  };
};

export default useTranslationApi;
