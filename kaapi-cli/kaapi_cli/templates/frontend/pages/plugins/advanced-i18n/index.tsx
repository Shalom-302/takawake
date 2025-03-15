import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Row, 
  Col, 
  Button, 
  Input, 
  Typography, 
  Tabs, 
  Modal, 
  Empty, 
  Spin, 
  Select,
  Dropdown,
  Menu,
  Badge,
  Space
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  GlobalOutlined,
  ImportOutlined,
  ExportOutlined,
  SettingOutlined,
  FilterOutlined,
  DownOutlined
} from '@ant-design/icons';
import styled, { createGlobalStyle } from 'styled-components';
import LanguageCard from '../../../components/plugins/advanced-i18n/LanguageCard';
import TranslationEditor from '../../../components/plugins/advanced-i18n/TranslationEditor';
import LanguageStatsCard from '../../../components/plugins/advanced-i18n/LanguageStatsCard';
import { useTranslationApi } from '../../../hooks/useTranslationApi'; // This would be your API hook

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Global styles for the page
const GlobalStyle = createGlobalStyle`
  body {
    background: #f7f9fc;
  }
`;

// Styled components with glassmorphism effects and gradients
const PageLayout = styled(Layout)`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #edf1f7);
`;

const GradientHeader = styled(Header)`
  background: linear-gradient(to right, #4e54c8, #8f94fb);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
`;

const HeaderTitle = styled(Title)`
  color: white !important;
  margin: 0 !important;
  font-size: 20px !important;
  display: flex;
  align-items: center;
  
  .anticon {
    margin-right: 12px;
    font-size: 24px;
  }
`;

const StyledContent = styled(Content)`
  padding: 24px;
  position: relative;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 10% 20%, rgba(78, 84, 200, 0.05) 0%, transparent 20%),
      radial-gradient(circle at 90% 50%, rgba(143, 148, 251, 0.05) 0%, transparent 25%),
      radial-gradient(circle at 30% 80%, rgba(78, 84, 200, 0.05) 0%, transparent 30%);
    z-index: -1;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionTitle = styled(Title)`
  margin-bottom: 24px !important;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(to right, #4e54c8, #8f94fb);
    border-radius: 3px;
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav::before {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .ant-tabs-tab {
    padding: 12px 16px;
    
    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #4e54c8;
      font-weight: 500;
    }
  }
  
  .ant-tabs-ink-bar {
    background: linear-gradient(to right, #4e54c8, #8f94fb);
    height: 3px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ActionButton = styled(Button)`
  margin-left: 12px;
  
  &.ant-btn-primary {
    background: linear-gradient(to right, #4e54c8, #8f94fb);
    border: none;
    
    &:hover, &:focus {
      background: linear-gradient(to right, #3b40a0, #7579e7);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(78, 84, 200, 0.3);
    }
  }
`;

const SeeMoreButton = styled(Button)`
  background: transparent;
  border: 1px solid rgba(78, 84, 200, 0.5);
  color: #4e54c8;
  font-weight: 500;
  display: block;
  margin: 24px auto;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(78, 84, 200, 0.1);
    border-color: #4e54c8;
    color: #4e54c8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(78, 84, 200, 0.15);
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const TranslationItem = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    border-color: rgba(78, 84, 200, 0.3);
  }
  
  .key {
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }
  
  .value {
    color: #666;
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    color: #999;
    font-size: 12px;
  }
`;

// Main Component
const AdvancedI18nPage: React.FC = () => {
  // State hooks
  const [activeTab, setActiveTab] = useState('languages');
  const [isLoading, setIsLoading] = useState(true);
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [stats, setStats] = useState({
    totalLanguages: 0,
    activeLanguages: 0,
    totalTranslations: 0,
    completionPercentage: 0,
    pendingReview: 0
  });
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  
  // Mock data to simulate API calls
  const mockLanguages = [
    {
      id: 1,
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flagCode: 'us',
      isRtl: false,
      isDefault: true,
      isEnabled: true,
      stats: {
        totalKeys: 245,
        translatedKeys: 245,
        missingKeys: 0,
        needsReview: 5,
        completionPercentage: 100
      }
    },
    {
      id: 2,
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flagCode: 'fr',
      isRtl: false,
      isDefault: false,
      isEnabled: true,
      stats: {
        totalKeys: 245,
        translatedKeys: 210,
        missingKeys: 35,
        needsReview: 12,
        completionPercentage: 85.7
      }
    },
    {
      id: 3,
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flagCode: 'de',
      isRtl: false,
      isDefault: false,
      isEnabled: true,
      stats: {
        totalKeys: 245,
        translatedKeys: 198,
        missingKeys: 47,
        needsReview: 8,
        completionPercentage: 80.8
      }
    },
    {
      id: 4,
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flagCode: 'es',
      isRtl: false,
      isDefault: false,
      isEnabled: true,
      stats: {
        totalKeys: 245,
        translatedKeys: 224,
        missingKeys: 21,
        needsReview: 15,
        completionPercentage: 91.4
      }
    },
    {
      id: 5,
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flagCode: 'sa',
      isRtl: true,
      isDefault: false,
      isEnabled: false,
      stats: {
        totalKeys: 245,
        translatedKeys: 120,
        missingKeys: 125,
        needsReview: 10,
        completionPercentage: 49.0
      }
    }
  ];
  
  const mockTranslations = [
    {
      id: 1,
      key: 'app.welcome',
      value: 'Welcome to our application',
      languageCode: 'en',
      groupName: 'common',
      context: 'Main welcome message on homepage',
      updatedAt: '2025-03-12T15:30:00Z'
    },
    {
      id: 2,
      key: 'app.login.title',
      value: 'Log in to your account',
      languageCode: 'en',
      groupName: 'auth',
      context: null,
      updatedAt: '2025-03-10T09:15:00Z'
    },
    {
      id: 3,
      key: 'app.login.email',
      value: 'Email address',
      languageCode: 'en',
      groupName: 'auth',
      context: 'Label for email input field',
      updatedAt: '2025-03-10T09:20:00Z'
    },
    {
      id: 4,
      key: 'app.welcome',
      value: 'Bienvenue sur notre application',
      languageCode: 'fr',
      groupName: 'common',
      context: 'Main welcome message on homepage',
      updatedAt: '2025-03-11T14:45:00Z'
    },
    {
      id: 5,
      key: 'app.login.title',
      value: 'Connectez-vous à votre compte',
      languageCode: 'fr',
      groupName: 'auth',
      context: null,
      updatedAt: '2025-03-09T11:30:00Z'
    }
  ];
  
  // Simulated API loading
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLanguages(mockLanguages);
      setTranslations(mockTranslations);
      setStats({
        totalLanguages: mockLanguages.length,
        activeLanguages: mockLanguages.filter(l => l.isEnabled).length,
        totalTranslations: 1042,
        completionPercentage: 87,
        pendingReview: 50
      });
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filter translations based on search and filters
  const filteredTranslations = translations.filter(translation => {
    // Filter by search query
    const matchesSearch = searchQuery ? 
      translation.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
      translation.value.toLowerCase().includes(searchQuery.toLowerCase()) : 
      true;
    
    // Filter by language
    const matchesLanguage = selectedLanguage === 'all' ? true : translation.languageCode === selectedLanguage;
    
    // Filter by group
    const matchesGroup = selectedGroup === 'all' ? true : translation.groupName === selectedGroup;
    
    return matchesSearch && matchesLanguage && matchesGroup;
  });
  
  // Handler functions
  const handleAddLanguage = () => {
    setEditingLanguage(null);
    setShowLanguageModal(true);
  };
  
  const handleEditLanguage = (id: number) => {
    const language = languages.find(lang => lang.id === id);
    setEditingLanguage(language);
    setShowLanguageModal(true);
  };
  
  const handleDeleteLanguage = (id: number) => {
    // Implementation would call API to delete language
    console.log(`Delete language with ID: ${id}`);
  };
  
  const handleSetDefaultLanguage = (id: number) => {
    // Implementation would call API to set default language
    console.log(`Set language with ID ${id} as default`);
  };
  
  const handleToggleLanguageEnabled = (id: number, enabled: boolean) => {
    // Implementation would call API to toggle language enabled status
    console.log(`Set language with ID ${id} enabled status to ${enabled}`);
  };
  
  const handleAddTranslation = () => {
    setEditingTranslation(null);
    setShowTranslationModal(true);
  };
  
  const handleEditTranslation = (id: number) => {
    const translation = translations.find(t => t.id === id);
    setEditingTranslation(translation);
    setShowTranslationModal(true);
  };
  
  const handleSaveLanguage = (languageData) => {
    // Implementation would call API to save language
    console.log('Save language:', languageData);
    setShowLanguageModal(false);
  };
  
  const handleSaveTranslation = (translationData) => {
    // Implementation would call API to save translation
    console.log('Save translation:', translationData);
    setShowTranslationModal(false);
  };
  
  const handleExport = () => {
    // Implementation would trigger export
    console.log('Export translations');
  };
  
  const handleImport = () => {
    // Implementation would trigger import modal
    console.log('Import translations');
  };
  
  // Render functions for different tabs
  const renderLanguagesTab = () => (
    <>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <LanguageStatsCard 
            totalLanguages={stats.totalLanguages}
            activeLanguages={stats.activeLanguages}
            totalTranslations={stats.totalTranslations}
            completionPercentage={stats.completionPercentage}
            pendingReview={stats.pendingReview}
          />
        </Col>
      </Row>
      
      <SectionTitle level={4} style={{ marginTop: 24 }}>Languages</SectionTitle>
      
      <SearchContainer>
        <Input 
          placeholder="Search languages..." 
          prefix={<SearchOutlined />} 
          style={{ flex: 1 }}
        />
        <ActionButton 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddLanguage}
        >
          Add Language
        </ActionButton>
      </SearchContainer>
      
      <Row gutter={[24, 24]}>
        {languages.map(language => (
          <Col xs={24} sm={12} md={8} lg={8} xl={6} key={language.id}>
            <LanguageCard 
              id={language.id}
              code={language.code}
              name={language.name}
              nativeName={language.nativeName}
              flagCode={language.flagCode}
              isRtl={language.isRtl}
              isDefault={language.isDefault}
              isEnabled={language.isEnabled}
              stats={language.stats}
              onEdit={handleEditLanguage}
              onDelete={handleDeleteLanguage}
              onSetDefault={handleSetDefaultLanguage}
              onToggleEnabled={handleToggleLanguageEnabled}
            />
          </Col>
        ))}
      </Row>
    </>
  );
  
  const renderTranslationsTab = () => (
    <>
      <SearchContainer>
        <Input 
          placeholder="Search translations by key or value..." 
          prefix={<SearchOutlined />} 
          style={{ flex: 1 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <Select
          defaultValue="all"
          style={{ width: 150, marginLeft: 12 }}
          onChange={(value) => setSelectedLanguage(value)}
        >
          <Option value="all">All Languages</Option>
          {languages.map(lang => (
            <Option key={lang.code} value={lang.code}>
              {lang.name}
            </Option>
          ))}
        </Select>
        
        <Select
          defaultValue="all"
          style={{ width: 150, marginLeft: 12 }}
          onChange={(value) => setSelectedGroup(value)}
        >
          <Option value="all">All Groups</Option>
          <Option value="common">Common</Option>
          <Option value="auth">Auth</Option>
          <Option value="errors">Errors</Option>
        </Select>
        
        <ActionButton 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddTranslation}
        >
          Add Translation
        </ActionButton>
      </SearchContainer>
      
      {filteredTranslations.length > 0 ? (
        <>
          {filteredTranslations.map(translation => (
            <TranslationItem key={translation.id} onClick={() => handleEditTranslation(translation.id)}>
              <div className="key">{translation.key}</div>
              <div className="value">{translation.value}</div>
              <div className="meta">
                <div>
                  <Badge color="#4e54c8" text={translation.languageCode.toUpperCase()} />
                  <span style={{ marginLeft: 12 }}>{translation.groupName}</span>
                </div>
                <div>Updated: {new Date(translation.updatedAt).toLocaleDateString()}</div>
              </div>
            </TranslationItem>
          ))}
          
          <SeeMoreButton>
            Load More Translations
          </SeeMoreButton>
        </>
      ) : (
        <EmptyStateContainer>
          <Empty 
            description="No translations found matching your criteria" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </EmptyStateContainer>
      )}
    </>
  );
  
  const renderSettingsTab = () => (
    <div>
      <SectionTitle level={4}>Settings</SectionTitle>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Import & Export" style={{ borderRadius: 12 }}>
            <p>Import translations from CSV, JSON or XLSX files, or export your translations to these formats.</p>
            <Space>
              <Button icon={<ImportOutlined />} onClick={handleImport}>
                Import Translations
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                Export Translations
              </Button>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Configuration" style={{ borderRadius: 12 }}>
            <p>Configure the translation system behavior.</p>
            <Form layout="vertical">
              <Form.Item label="Default Language">
                <Select defaultValue="en">
                  {languages.map(lang => (
                    <Option key={lang.code} value={lang.code}>
                      {lang.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="Auto-detect User Language">
                <Switch defaultChecked />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  return (
    <>
      <GlobalStyle />
      <PageLayout>
        <GradientHeader>
          <HeaderTitle level={4}>
            <GlobalOutlined /> Advanced Internationalization
          </HeaderTitle>
          <Space>
            <Button type="text" icon={<ImportOutlined />} style={{ color: 'white' }}>
              Import
            </Button>
            <Button type="text" icon={<ExportOutlined />} style={{ color: 'white' }}>
              Export
            </Button>
            <Button type="text" icon={<SettingOutlined />} style={{ color: 'white' }}>
              Settings
            </Button>
          </Space>
        </GradientHeader>
        
        <StyledContent>
          <ContentContainer>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <StyledTabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                size="large"
              >
                <TabPane 
                  tab={<span><GlobalOutlined /> Languages</span>} 
                  key="languages"
                >
                  {renderLanguagesTab()}
                </TabPane>
                
                <TabPane 
                  tab={<span><TranslationOutlined /> Translations</span>} 
                  key="translations"
                >
                  {renderTranslationsTab()}
                </TabPane>
                
                <TabPane 
                  tab={<span><SettingOutlined /> Settings</span>} 
                  key="settings"
                >
                  {renderSettingsTab()}
                </TabPane>
              </StyledTabs>
            )}
          </ContentContainer>
        </StyledContent>
      </PageLayout>
      
      {/* Language Modal */}
      <Modal
        title={editingLanguage ? "Edit Language" : "Add New Language"}
        visible={showLanguageModal}
        onCancel={() => setShowLanguageModal(false)}
        footer={null}
        width={600}
      >
        <LanguageForm 
          initialValues={editingLanguage} 
          onSave={handleSaveLanguage} 
          onCancel={() => setShowLanguageModal(false)} 
        />
      </Modal>
      
      {/* Translation Modal */}
      <Modal
        title={editingTranslation ? "Edit Translation" : "Add New Translation"}
        visible={showTranslationModal}
        onCancel={() => setShowTranslationModal(false)}
        footer={null}
        width={800}
      >
        <TranslationEditor
          translationId={editingTranslation?.id}
          languageCode={editingTranslation?.languageCode}
          groupName={editingTranslation?.groupName}
          translationKey={editingTranslation?.key}
          onSave={handleSaveTranslation}
          onCancel={() => setShowTranslationModal(false)}
        />
      </Modal>
    </>
  );
};

// Language form component (placeholder)
const LanguageForm = ({ initialValues, onSave, onCancel }) => {
  // This would be implemented with a proper form
  return (
    <div>
      <p>Form to {initialValues ? "edit" : "create"} a language would go here</p>
      <Space>
        <Button type="primary" onClick={() => onSave({})}>Save</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </div>
  );
};

// Missing styled component for Switch
const Form = styled.form``;
const Switch = styled.input.attrs({ type: 'checkbox' })``;

export default AdvancedI18nPage;
