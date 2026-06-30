import { TemplateForm } from '../components/TemplateForm';

export default function NewTemplatePage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Create Email Template</h1>
      <TemplateForm />
    </div>
  );
}
