import React from 'react';
import { Badge, Card, Progress, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import styled from 'styled-components';

// Types
interface LanguageProps {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flagCode?: string;
  isRtl: boolean;
  isDefault: boolean;
  isEnabled: boolean;
  stats: {
    totalKeys: number;
    translatedKeys: number;
    missingKeys: number;
    needsReview: number;
    completionPercentage: number;
  };
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  onToggleEnabled: (id: number, enabled: boolean) => void;
}

// Styled components with glassmorphism effect
const GlassCard = styled(Card)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(31, 38, 135, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .ant-card-head {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(to right, rgba(78, 84, 200, 0.1), rgba(143, 148, 251, 0.1));
  }
  
  .ant-card-body {
    padding: 20px;
  }
  
  .ant-card-actions {
    background: rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const LanguageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LanguageFlag = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  
  img {
    width: 100%;
    height: auto;
  }
`;

const LanguageInfo = styled.div`
  flex: 1;
`;

const LanguageName = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LanguageNativeName = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 2px;
`;

const StatsContainer = styled.div`
  margin-top: 16px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
`;

const StatLabel = styled.span`
  color: #666;
`;

const StatValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const ProgressContainer = styled.div`
  margin-top: 12px;
`;

// Component
const LanguageCard: React.FC<LanguageProps> = ({
  id,
  code,
  name,
  nativeName,
  flagCode,
  isRtl,
  isDefault,
  isEnabled,
  stats,
  onEdit,
  onDelete,
  onSetDefault,
  onToggleEnabled,
}) => {
  // Progress status
  const getProgressStatus = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 60) return 'normal';
    return 'exception';
  };

  return (
    <GlassCard
      title={
        <LanguageHeader>
          <LanguageFlag>
            {flagCode ? (
              <img 
                src={`https://flagcdn.com/w80/${flagCode.toLowerCase()}.png`} 
                alt={`${name} flag`} 
              />
            ) : (
              <GlobalOutlined />
            )}
          </LanguageFlag>
          <LanguageInfo>
            <LanguageName>
              {name}
              {isDefault && (
                <Tooltip title="Default language">
                  <Badge status="processing" color="#1890ff" />
                </Tooltip>
              )}
              {!isEnabled && (
                <Tooltip title="Language disabled">
                  <Badge status="default" />
                </Tooltip>
              )}
              {isRtl && (
                <Tooltip title="Right-to-left">
                  <Badge 
                    style={{ backgroundColor: 'transparent', color: '#666' }} 
                    count="RTL" 
                  />
                </Tooltip>
              )}
            </LanguageName>
            <LanguageNativeName>{nativeName} ({code})</LanguageNativeName>
          </LanguageInfo>
        </LanguageHeader>
      }
      actions={[
        <Tooltip title="Edit language">
          <EditOutlined key="edit" onClick={() => onEdit(id)} />
        </Tooltip>,
        <Tooltip title={isEnabled ? "Disable language" : "Enable language"}>
          <CheckCircleOutlined 
            key="enable" 
            onClick={() => onToggleEnabled(id, !isEnabled)} 
            style={{ color: isEnabled ? '#52c41a' : '#d9d9d9' }}
          />
        </Tooltip>,
        <Tooltip title="Set as default">
          <GlobalOutlined 
            key="default" 
            onClick={() => onSetDefault(id)} 
            style={{ color: isDefault ? '#1890ff' : '#d9d9d9' }}
          />
        </Tooltip>,
        <Tooltip title="Delete language">
          <DeleteOutlined 
            key="delete" 
            onClick={() => onDelete(id)} 
            style={{ color: '#ff4d4f' }}
          />
        </Tooltip>,
      ]}
    >
      <StatsContainer>
        <StatRow>
          <StatLabel>Total Keys:</StatLabel>
          <StatValue>{stats.totalKeys}</StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>Translated:</StatLabel>
          <StatValue>{stats.translatedKeys}</StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>Missing:</StatLabel>
          <StatValue>{stats.missingKeys}</StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>Needs Review:</StatLabel>
          <StatValue>{stats.needsReview}</StatValue>
        </StatRow>
      </StatsContainer>
      
      <ProgressContainer>
        <Progress 
          percent={Math.round(stats.completionPercentage)} 
          status={getProgressStatus(stats.completionPercentage) as any}
          strokeColor={{
            '0%': '#4e54c8',
            '100%': '#8f94fb',
          }}
        />
      </ProgressContainer>
    </GlassCard>
  );
};

export default LanguageCard;
