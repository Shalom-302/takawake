"""
Payment models for the payment plugin.

This module defines the database models and schema models for payments
and related entities.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Enum as SQLEnum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

from app.core.db import Base

# Enum classes
class PaymentStatus(str, Enum):
    """Status of a payment."""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    DISPUTED = "disputed"

class RefundStatus(str, Enum):
    """Refund status enum."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class PaymentMethod(str, Enum):
    """Payment methods supported by the system."""
    # Global methods
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    APPLE_PAY = "apple_pay"
    GOOGLE_PAY = "google_pay"
    CRYPTOCURRENCY = "cryptocurrency"
    
    # African-specific methods
    MOBILE_MONEY = "mobile_money"
    M_PESA = "m_pesa"
    ORANGE_MONEY = "orange_money"
    MTN_MOBILE_MONEY = "mtn_mobile_money"
    AIRTEL_MONEY = "airtel_money"
    WAVE = "wave"
    SENEGAL_WAVE = "senegal_wave"
    MOOV_MONEY = "moov_money"
    ECOCASH = "ecocash"
    CHIPPER_CASH = "chipper_cash"
    AFRICA_PAYDO = "africa_paydo"
    FLW_BANK_TRANSFER = "flw_bank_transfer"
    USSD = "ussd"
    
    # Other methods
    CASH_ON_DELIVERY = "cash_on_delivery"
    STORE_CREDIT = "store_credit"
    VOUCHER = "voucher"
    OTHER = "other"

class Currency(str, Enum):
    """Currencies supported by the system."""
    # Major global currencies
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    JPY = "JPY"
    
    # African currencies
    NGN = "NGN"  # Nigerian Naira
    KES = "KES"  # Kenyan Shilling
    GHS = "GHS"  # Ghanaian Cedi
    XOF = "XOF"  # West African CFA franc
    ZAR = "ZAR"  # South African Rand
    EGP = "EGP"  # Egyptian Pound
    MAD = "MAD"  # Moroccan Dirham
    TZS = "TZS"  # Tanzanian Shilling
    UGX = "UGX"  # Ugandan Shilling
    XAF = "XAF"  # Central African CFA franc
    RWF = "RWF"  # Rwandan Franc
    ETB = "ETB"  # Ethiopian Birr

class ApprovalStatus(str, Enum):
    """Status of an approval."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SKIPPED = "skipped"

# Association tables
payment_approver = Table(
    "payment_approver",
    Base.metadata,
    Column("payment_id", Integer, ForeignKey("payments.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
)

# Database models
class PaymentDB(Base):
    """Database model for a payment."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default=PaymentStatus.DRAFT.value)
    payment_method = Column(String, nullable=False)
    provider = Column(String, nullable=True)
    provider_reference = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id], backref="created_payments")
    customer = relationship("User", foreign_keys=[customer_id], backref="customer_payments")
    approvers = relationship("User", secondary=payment_approver, backref="payment_approvals")
    approval_steps = relationship("PaymentApprovalStepDB", back_populates="payment", cascade="all, delete-orphan")
    transactions = relationship("PaymentTransactionDB", back_populates="payment", cascade="all, delete-orphan")
    refunds = relationship("PaymentRefundDB", back_populates="payment", cascade="all, delete-orphan")
    
    # Stats
    refunded_amount = Column(Float, default=0.0)
    is_fully_refunded = Column(Boolean, default=False)

class PaymentApprovalStepDB(Base):
    """Database model for a payment approval step."""
    __tablename__ = "payment_approval_steps"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"))
    approver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, nullable=False, default=ApprovalStatus.PENDING.value)
    comments = Column(String, nullable=True)
    step_order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    payment = relationship("PaymentDB", back_populates="approval_steps")
    approver = relationship("User")

class PaymentTransactionDB(Base):
    """Database model for a payment transaction."""
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"))
    reference = Column(String, unique=True, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    provider_reference = Column(String, nullable=True)
    transaction_type = Column(String, nullable=False)  # e.g., payment, refund, capture, etc.
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    payment = relationship("PaymentDB", back_populates="transactions")

class PaymentRefundDB(Base):
    """Database model for a payment refund."""
    __tablename__ = "payment_refunds"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"))
    reference = Column(String, unique=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    status = Column(String, default=RefundStatus.PENDING.value, nullable=False)
    provider = Column(String, nullable=True)
    provider_reference = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    
    # Relations
    refunded_by_id = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    payment = relationship("PaymentDB", back_populates="refunds")
    transaction = relationship("PaymentTransactionDB", uselist=False, foreign_keys=[id])

# Pydantic models
class PaymentBase(BaseModel):
    """Base model for payment schema."""
    amount: float = Field(..., gt=0, description="Payment amount")
    currency: Currency = Field(..., description="Payment currency")
    payment_method: PaymentMethod = Field(..., description="Payment method")
    description: Optional[str] = Field(None, description="Payment description")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    customer_id: Optional[int] = Field(None, description="Customer ID if different from creator")

class PaymentCreate(PaymentBase):
    """Schema for creating a new payment."""
    provider: Optional[str] = Field(None, description="Payment provider")
    require_approval: bool = Field(False, description="Whether this payment requires approval")
    approval_workflow: Optional[str] = Field(None, description="Approval workflow to use")
    approvers: Optional[List[int]] = Field(None, description="List of approver user IDs")

class PaymentUpdate(BaseModel):
    """Schema for updating an existing payment."""
    amount: Optional[float] = Field(None, gt=0, description="Payment amount")
    currency: Optional[Currency] = Field(None, description="Payment currency")
    payment_method: Optional[PaymentMethod] = Field(None, description="Payment method")
    description: Optional[str] = Field(None, description="Payment description")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    provider: Optional[str] = Field(None, description="Payment provider")

class PaymentApproval(BaseModel):
    """Schema for approving a payment."""
    comments: Optional[str] = Field(None, description="Approval comments")

class RefundCreate(BaseModel):
    """Schema for creating a refund."""
    amount: float = Field(..., gt=0, description="Refund amount")
    reason: Optional[str] = Field(None, description="Refund reason")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class RefundResponse(BaseModel):
    """Schema for refund response."""
    id: int
    payment_id: int
    reference: str
    amount: float
    currency: str
    reason: Optional[str] = None
    status: str
    provider: Optional[str] = None
    provider_reference: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    refunded_by_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class ApprovalStepResponse(BaseModel):
    """Schema for payment approval step response."""
    id: int
    approver_id: int
    approver_name: str
    status: ApprovalStatus
    comments: Optional[str]
    step_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TransactionResponse(BaseModel):
    """Schema for payment transaction response."""
    id: int
    reference: str
    amount: float
    status: str
    provider: str
    provider_reference: Optional[str]
    transaction_type: str
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        orm_mode = True

class PaymentResponse(BaseModel):
    """Schema for payment response."""
    id: int
    reference: str
    amount: float
    currency: Currency
    description: Optional[str]
    status: PaymentStatus
    payment_method: PaymentMethod
    provider: Optional[str]
    provider_reference: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    created_by_id: int
    customer_id: Optional[int]
    approval_steps: List[ApprovalStepResponse] = []
    transactions: List[TransactionResponse] = []
    refunds: List[RefundResponse] = []
    payment_url: Optional[str] = None
    refunded_amount: Optional[float] = 0.0
    is_fully_refunded: Optional[bool] = False

    @validator('reference')
    def reference_must_not_be_empty(cls, v):
        if not v:
            return str(uuid.uuid4())
        return v

    class Config:
        orm_mode = True
