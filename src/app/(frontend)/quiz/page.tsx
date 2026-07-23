import React from "react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Product Quiz",
  description: "Find the perfect product for you with our interactive quiz."
};

export default function QuizPage() {
  return (
    <div className="container" style={{ padding: '60px 24px', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#0f172a' }}>Product Match Quiz</h1>
      <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
        Our interactive quiz is currently undergoing an upgrade to bring you even better personalized recommendations. 
        Please check back soon!
      </p>
      <div style={{ marginTop: '32px' }}>
        <a href="/" style={{ background: '#D63062', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}
