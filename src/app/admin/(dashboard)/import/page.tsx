import { ImportForm } from "@/components/ImportForm";

export const dynamic = 'force-dynamic';


export default function AdminImportPage() {
  return (
    <main className="container">
      <ImportForm />
      <div className="form-card" style={{ marginTop: 20 }}>
        <h2>Large import rule</h2>
        <p className="muted">
          For 2 lakh products, run Redis + worker. Do not process huge CSV files inside a normal browser request.
        </p>
        <pre className="code">npm run worker:import</pre>
      </div>
    </main>
  );
}
