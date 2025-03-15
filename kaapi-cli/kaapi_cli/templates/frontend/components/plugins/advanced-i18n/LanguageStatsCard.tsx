import React from 'react';
import { Card, Statistic, Row, Col, Tooltip } from 'antd';
import { 
  GlobalOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  SyncOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

// Define the Props interface
interface LanguageStatsCardProps {
  totalLanguages: number;
  activeLanguages: number;
  totalTranslations: number;
  completionPercentage: number;
  pendingReview: number;
}

// Styled components with glassmorphism effect
const StatsCard = styled(Card)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  overflow: hidden;
  height: 100%;
  
  .ant-card-body {
    padding: 24px;
  }
`;

const GradientIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #4e54c8, #8f94fb);
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(78, 84, 200, 0.3);
`;

const StatisticTitle = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
`;

const StatisticValue = styled.div`
  color: #333;
  font-size: 24px;
  font-weight: 600;
`;

const CompletionBar = styled.div<{ percentage: number }>`
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background: linear-gradient(to right, #4e54c8, #8f94fb);
    border-radius: 3px;
  }
`;

// The main component
const LanguageStatsCard: React.FC<LanguageStatsCardProps> = ({
  totalLanguages,
  activeLanguages,
  totalTranslations,
  completionPercentage,
  pendingReview
}) => {
  return (
    <StatsCard>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Tooltip title="Total number of languages in the system">
            <div>
              <GradientIcon>
                <GlobalOutlined />
              </GradientIcon>
              <StatisticTitle>Languages</StatisticTitle>
              <StatisticValue>{totalLanguages}</StatisticValue>
              <div style={{ color: '#888', fontSize: '13px' }}>
                {activeLanguages} active
              </div>
            </div>
          </Tooltip>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={8}>
          <Tooltip title="Total number of translations across all languages">
            <div>
              <GradientIcon>
                <FileTextOutlined />
              </GradientIcon>
              <StatisticTitle>Translations</StatisticTitle>
              <StatisticValue>{totalTranslations.toLocaleString()}</StatisticValue>
              <div style={{ color: '#888', fontSize: '13px' }}>
                across all languages
              </div>
            </div>
          </Tooltip>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={8}>
          <Tooltip title="Translations pending review">
            <div>
              <GradientIcon>
                <SyncOutlined />
              </GradientIcon>
              <StatisticTitle>Pending Review</StatisticTitle>
              <StatisticValue>{pendingReview}</StatisticValue>
              <div style={{ color: '#888', fontSize: '13px' }}>
                needs attention
              </div>
            </div>
          </Tooltip>
        </Col>
        
        <Col span={24}>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <StatisticTitle>Overall Completion</StatisticTitle>
              <div style={{ color: '#666', fontWeight: 500 }}>{completionPercentage}%</div>
            </div>
            <CompletionBar percentage={completionPercentage} />
          </div>
        </Col>
      </Row>
    </StatsCard>
  );
};

export default LanguageStatsCard;
