import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Switch, 
  Button, 
  Select, 
  Row, 
  Col, 
  Divider, 
  Alert, 
  Space,
  Tooltip
} from 'antd';
import { 
  GlobalOutlined, 
  TranslationOutlined, 
  FlagOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslationApi } from '../../../hooks/useTranslationApi';

// Types
interface LanguageFormProps {
  initialValues?: {
    id?: number;
    code?: string;
    name?: string;
    nativeName?: string;
    flagCode?: string;
    isRtl?: boolean;
    isDefault?: boolean;
    isEnabled?: boolean;
  };
  onSave: (values: any) => void;
  onCancel: () => void;
}

// Styled components with glassmorphism effect
const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    color: #333;
    font-weight: 500;
  }
  
  .ant-input, .ant-select-selector {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
  
  .ant-switch-checked {
    background: linear-gradient(to right, #4e54c8, #8f94fb);
  }
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 16px rgba(31, 38, 135, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 16px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  .anticon {
    margin-right: 8px;
    color: #4e54c8;
  }
`;

const ActionButton = styled(Button)`
  &.ant-btn-primary {
    background: linear-gradient(to right, #4e54c8, #8f94fb);
    border: none;
    
    &:hover {
      background: linear-gradient(to right, #3b40a0, #7579e7);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(78, 84, 200, 0.3);
    }
  }
`;

const FlagPreview = styled.div`
  width: 100%;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

// Common language data
const commonLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flagCode: 'us', isRtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flagCode: 'fr', isRtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flagCode: 'es', isRtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flagCode: 'de', isRtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flagCode: 'it', isRtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flagCode: 'pt', isRtl: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flagCode: 'nl', isRtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flagCode: 'ru', isRtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flagCode: 'jp', isRtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flagCode: 'cn', isRtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flagCode: 'sa', isRtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flagCode: 'in', isRtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flagCode: 'kr', isRtl: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flagCode: 'tr', isRtl: false }
];

// Country codes for flag selection
const countryCodes = [
  'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az', 
  'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bl', 'bm', 'bn', 'bo', 'bq', 'br', 'bs', 
  'bt', 'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 
  'co', 'cr', 'cu', 'cv', 'cw', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 
  'eg', 'eh', 'er', 'es', 'et', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gb', 'gd', 'ge', 'gf', 
  'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 
  'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 
  'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 
  'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mk', 
  'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 
  'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 
  'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 
  'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'ss', 
  'st', 'sv', 'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm', 'tn', 'to', 
  'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'um', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 
  'vn', 'vu', 'wf', 'ws', 'xk', 'ye', 'yt', 'za', 'zm', 'zw'
];

// Component
const LanguageForm: React.FC<LanguageFormProps> = ({
  initialValues,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [selectedCommonLanguage, setSelectedCommonLanguage] = useState<string | null>(null);
  const [flagCode, setFlagCode] = useState<string>(initialValues?.flagCode || '');
  const { createLanguage, updateLanguage } = useTranslationApi();
  
  // If a common language is selected, prefill the form
  const handleCommonLanguageSelect = (value: string) => {
    if (!value) return;
    
    setSelectedCommonLanguage(value);
    const selected = commonLanguages.find(lang => lang.code === value);
    
    if (selected) {
      form.setFieldsValue({
        code: selected.code,
        name: selected.name,
        nativeName: selected.nativeName,
        flagCode: selected.flagCode,
        isRtl: selected.isRtl
      });
      
      setFlagCode(selected.flagCode);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      if (initialValues?.id) {
        await updateLanguage(initialValues.id, values);
      } else {
        await createLanguage(values);
      }
      
      onSave(values);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };
  
  // Handle flag code change
  const handleFlagCodeChange = (value: string) => {
    setFlagCode(value);
  };

  return (
    <StyledForm
      form={form}
      layout="vertical"
      initialValues={{
        code: initialValues?.code || '',
        name: initialValues?.name || '',
        nativeName: initialValues?.nativeName || '',
        flagCode: initialValues?.flagCode || '',
        isRtl: initialValues?.isRtl || false,
        isDefault: initialValues?.isDefault || false,
        isEnabled: initialValues?.isEnabled !== undefined ? initialValues.isEnabled : true
      }}
      onFinish={handleSubmit}
    >
      {!initialValues?.id && (
        <FormSection>
          <SectionTitle>
            <GlobalOutlined /> Quick Setup
          </SectionTitle>
          <Form.Item
            label="Select from common languages"
            extra="Choose a common language to pre-fill the form"
          >
            <Select
              placeholder="Select a language"
              allowClear
              onChange={handleCommonLanguageSelect}
              value={selectedCommonLanguage}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {commonLanguages.map(lang => (
                <Select.Option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </FormSection>
      )}
      
      <FormSection>
        <SectionTitle>
          <TranslationOutlined /> Language Details
        </SectionTitle>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="code"
              label="Language Code"
              tooltip="ISO 639-1 language code (e.g., en, fr, es)"
              rules={[
                { required: true, message: 'Please enter a language code' },
                { max: 10, message: 'Language code must be at most 10 characters' },
                { pattern: /^[a-z]{2,3}(-[a-z]{2,3})?$/i, message: 'Invalid language code format' }
              ]}
            >
              <Input placeholder="e.g., en, fr-ca, es" />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="name"
              label="Display Name"
              tooltip="Name of the language in English"
              rules={[
                { required: true, message: 'Please enter a display name' },
                { max: 50, message: 'Display name must be at most 50 characters' }
              ]}
            >
              <Input placeholder="e.g., English, French" />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="nativeName"
              label="Native Name"
              tooltip="Name of the language in its native form"
              rules={[
                { required: true, message: 'Please enter a native name' },
                { max: 50, message: 'Native name must be at most 50 characters' }
              ]}
            >
              <Input placeholder="e.g., English, Français" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="flagCode"
              label="Flag Code"
              tooltip="ISO 3166-1 alpha-2 country code for displaying the flag"
            >
              <Select
                placeholder="Select country for flag"
                showSearch
                onChange={handleFlagCodeChange}
                filterOption={(input, option) =>
                  option.value.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                dropdownRender={menu => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '4px 0' }} />
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                      <small>Country code for flag display</small>
                    </div>
                  </div>
                )}
              >
                {countryCodes.map(code => (
                  <Select.Option key={code} value={code}>
                    {code.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            {flagCode && (
              <FlagPreview>
                <img
                  src={`https://flagcdn.com/w160/${flagCode.toLowerCase()}.png`}
                  alt="Selected flag"
                />
              </FlagPreview>
            )}
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="isRtl"
              label="Right-to-Left"
              tooltip="Enable for languages written from right to left (e.g., Arabic, Hebrew)"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            {initialValues?.id && (
              <>
                <Form.Item
                  name="isDefault"
                  label="Default Language"
                  tooltip="Set as the default language for the application"
                  valuePropName="checked"
                >
                  <Switch disabled={initialValues.isDefault} />
                </Form.Item>
                
                <Form.Item
                  name="isEnabled"
                  label="Enabled"
                  tooltip="Enable or disable this language"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </>
            )}
          </Col>
        </Row>
        
        {form.getFieldValue('isRtl') && (
          <Alert
            message="Right-to-Left Language"
            description="This language will be displayed from right to left. Ensure your application UI supports RTL layouts."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </FormSection>
      
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <ActionButton 
            type="primary" 
            htmlType="submit"
            icon={<CheckCircleOutlined />}
          >
            {initialValues?.id ? 'Update Language' : 'Create Language'}
          </ActionButton>
        </Space>
      </div>
    </StyledForm>
  );
};

export default LanguageForm;
