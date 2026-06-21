import Sidebar from './Sidebar';
import Header from './Header';

export default function PageWrapper({ children, title, subtitle, action }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title={title} subtitle={subtitle} />
        <main className="page-body">
          {action && (
            <div className="page-header">
              <div>
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
              </div>
              <div>{action}</div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
