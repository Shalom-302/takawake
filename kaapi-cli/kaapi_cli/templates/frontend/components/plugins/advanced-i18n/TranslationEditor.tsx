import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Space, 
  Select, 
  Card, 
  Tabs, 
  notification, 
  Tooltip, 
  Dropdown, 
  Menu 
} from 'antd';
import { 
  SaveOutlined, 
  TranslationOutlined, 
  HistoryOutlined,
  CodeOutlined,
  TagOutlined,
  EllipsisOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslationApi } from '../../../hooks/useTranslationApi';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// Types
interface TranslationEditorProps {
  translationId?: number;
  languageCode?: string;
  groupName?: string;
  translationKey?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface PluralForm {
  quantity: string;
  value: string;
}

interface TranslationForm {
  key: string;
  value: string;
  languageCode: string;
  groupName: string;
  context?: string;
  pluralForms?: PluralForm[];
  isMachineTranslated: boolean;
  needsReview: boolean;
}

// Styled components with glassmorphism effect
const EditorCard = styled(Card)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  width: 100%;
  margin-bottom: 24px;
  
  .ant-card-head {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(to right, rgba(78, 84, 200, 0.1), rgba(143, 148, 251, 0.1));
  }
  
  .ant-card-body {
    padding: 24px;
  }
  
  .ant-form-item-label > label {
    color: #333;
    font-weight: 500;
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav::before {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .ant-tabs-tab {
    color: rgba(0, 0, 0, 0.6);
    
    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #4e54c8;
    }
  }
  
  .ant-tabs-ink-bar {
    background: linear-gradient(to right, #4e54c8, #8f94fb);
  }
`;

const PluralFormContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButton = styled(Button)`
  &.ant-btn-primary {
    background: linear-gradient(to right, #4e54c8, #8f94fb);
    border: none;
    
    &:hover {
      background: linear-gradient(to right, #3c42a1, #757de8);
    }
  }
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  .label {
    color: #666;
    margin-right: 8px;
    min-width: 100px;
  }
  
  .value {
    color: #333;
    font-weight: 500;
  }
`;

// Component
const TranslationEditor: React.FC<TranslationEditorProps> = ({
  translationId,
  languageCode,
  groupName,
  translationKey,
  onSave,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [translationHistory, setTranslationHistory] = useState([]);
  const { getLanguages, getGroups, getTranslation, getTranslationHistory, createTranslation, updateTranslation } = useTranslationApi();

  // Available plural forms
  const pluralForms = [
    { value: 'zero', label: 'Zero' },
    { value: 'one', label: 'One (Singular)' },
    { value: 'two', label: 'Two (Dual)' },
    { value: 'few', label: 'Few (Paucal)' },
    { value: 'many', label: 'Many' },
    { value: 'other', label: 'Other (General plural)' }
  ];

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load languages and groups
        const [languagesData, groupsData] = await Promise.all([
          getLanguages(),
          getGroups()
        ]);
        
        setLanguages(languagesData);
        setGroups(groupsData);
        
        // If editing an existing translation
        if (translationId) {
          const [translationData, historyData] = await Promise.all([
            getTranslation(translationId),
            getTranslationHistory(translationId)
          ]);
          
          form.setFieldsValue({
            key: translationData.key,
            value: translationData.value,
            languageCode: translationData.language.code,
            groupName: translationData.group.name,
            context: translationData.context,
            pluralForms: translationData.pluralForms || [],
            isMachineTranslated: translationData.isMachineTranslated,
            needsReview: translationData.needsReview
          });
          
          setTranslationHistory(historyData);
        } else if (languageCode && groupName && translationKey) {
          // If creating a new translation with pre-filled data
          form.setFieldsValue({
            languageCode,
            groupName,
            key: translationKey,
            isMachineTranslated: false,
            needsReview: false
          });
        }
      } catch (error) {
        notification.error({
          message: 'Error loading data',
          description: error.message
        });
      }
    };
    
    loadData();
  }, [translationId, languageCode, groupName, translationKey]);

  // Handle form submission
  const handleSubmit = async (values: TranslationForm) => {
    setIsLoading(true);
    
    try {
      if (translationId) {
        // Update existing translation
        await updateTranslation(translationId, values);
        notification.success({
          message: 'Translation updated',
          description: 'The translation has been updated successfully.'
        });
      } else {
        // Create new translation
        await createTranslation(values);
        notification.success({
          message: 'Translation created',
          description: 'The translation has been created successfully.'
        });
      }
      
      onSave();
    } catch (error) {
      notification.error({
        message: 'Error saving translation',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Machine translation feature (placeholder)
  const handleMachineTranslation = () => {
    notification.info({
      message: 'Machine Translation',
      description: 'This would connect to a translation API to automatically translate this text.'
    });
  };

  return (
    <EditorCard
      title={translationId ? 'Edit Translation' : 'Create Translation'}
      bordered={false}
    >
      <StyledTabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={<span><TranslationOutlined /> Basic Information</span>} 
          key="basic"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isMachineTranslated: false,
              needsReview: false
            }}
          >
            <Form.Item
              name="key"
              label="Translation Key"
              rules={[{ required: true, message: 'Please enter a translation key' }]}
            >
              <Input prefix={<CodeOutlined />} placeholder="e.g., app.login.welcome" />
            </Form.Item>
            
            <Form.Item
              name="languageCode"
              label="Language"
              rules={[{ required: true, message: 'Please select a language' }]}
            >
              <Select 
                placeholder="Select language"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {languages.map(lang => (
                  <Option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="groupName"
              label="Group"
              rules={[{ required: true, message: 'Please select a group' }]}
            >
              <Select 
                placeholder="Select group"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                dropdownRender={menu => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #e8e8e8' }}>
                      <Button
                        type="link"
                        icon={<TagOutlined />}
                        block
                      >
                        Add New Group
                      </Button>
                    </div>
                  </>
                )}
              >
                {groups.map(group => (
                  <Option key={group.id} value={group.name}>
                    {group.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="value"
              label="Translation Value"
              rules={[{ required: true, message: 'Please enter a translation value' }]}
            >
              <TextArea 
                rows={4}
                placeholder="Enter translation text"
                style={{ resize: 'vertical' }}
              />
            </Form.Item>
            
            <Form.Item
              name="context"
              label="Context (Optional)"
            >
              <Input placeholder="Provide context for translators if needed" />
            </Form.Item>
            
            <Form.Item
              name="needsReview"
              valuePropName="checked"
            >
              <Space>
                <Form.Item name="needsReview" valuePropName="checked" noStyle>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item key="1">Mark as reviewed</Menu.Item>
                        <Menu.Item key="2">Flag for review</Menu.Item>
                        <Menu.Item key="3">
                          <Tooltip title="This will use machine translation to generate a translation">
                            <span>
                              <TranslationOutlined /> Use machine translation
                            </span>
                          </Tooltip>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button icon={<EllipsisOutlined />}>
                      More Actions
                    </Button>
                  </Dropdown>
                </Form.Item>
              </Space>
            </Form.Item>
            
            <Form.Item>
              <Space>
                <ActionButton
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={isLoading}
                >
                  {translationId ? 'Update Translation' : 'Create Translation'}
                </ActionButton>
                
                <Button onClick={onCancel}>
                  Cancel
                </Button>
                
                <Button
                  type="default"
                  icon={<TranslationOutlined />}
                  onClick={handleMachineTranslation}
                >
                  Machine Translate
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>
        
        <TabPane 
          tab={<span><TagOutlined /> Plural Forms</span>} 
          key="plural"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <p>Plural forms allow you to specify different translations based on quantity.</p>
            
            <Form.List name="pluralForms">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(field => (
                    <PluralFormContainer key={field.key}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'quantity']}
                          fieldKey={[field.fieldKey, 'quantity']}
                          label="Quantity"
                          rules={[{ required: true, message: 'Please select a quantity' }]}
                        >
                          <Select placeholder="Select quantity">
                            {pluralForms.map(form => (
                              <Option key={form.value} value={form.value}>
                                {form.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        
                        <Form.Item
                          {...field}
                          name={[field.name, 'value']}
                          fieldKey={[field.fieldKey, 'value']}
                          label="Translation"
                          rules={[{ required: true, message: 'Please enter a translation' }]}
                        >
                          <TextArea 
                            rows={2}
                            placeholder="e.g., 'No items', 'One item', 'Many items'"
                          />
                        </Form.Item>
                      </Space>
                      <Button 
                        type="link" 
                        danger 
                        onClick={() => remove(field.name)}
                        style={{ marginTop: 8 }}
                      >
                        Remove this plural form
                      </Button>
                    </PluralFormContainer>
                  ))}
                  
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<TagOutlined />}
                    >
                      Add Plural Form
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            
            <Form.Item>
              <ActionButton
                type="primary"
                onClick={() => {
                  form.validateFields().then(values => {
                    handleSubmit(values);
                  });
                }}
                icon={<SaveOutlined />}
                loading={isLoading}
              >
                {translationId ? 'Update Translation' : 'Create Translation'}
              </ActionButton>
            </Form.Item>
          </Form>
        </TabPane>
        
        {translationId && (
          <TabPane 
            tab={<span><HistoryOutlined /> History</span>} 
            key="history"
          >
            {translationHistory.length > 0 ? (
              <div>
                {translationHistory.map((item, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    style={{ marginBottom: 16, background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <MetadataItem>
                      <span className="label">Date:</span>
                      <span className="value">{new Date(item.createdAt).toLocaleString()}</span>
                    </MetadataItem>
                    
                    <MetadataItem>
                      <span className="label">User:</span>
                      <span className="value">{item.userName || 'System'}</span>
                    </MetadataItem>
                    
                    <MetadataItem>
                      <span className="label">Old Value:</span>
                      <span className="value">{item.oldValue || <i>None</i>}</span>
                    </MetadataItem>
                    
                    <MetadataItem>
                      <span className="label">New Value:</span>
                      <span className="value">{item.newValue}</span>
                    </MetadataItem>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="No history found for this translation" />
            )}
          </TabPane>
        )}
      </StyledTabs>
    </EditorCard>
  );
};

export default TranslationEditor;
