import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#2c3e50', fontSize: '2.5rem' }}>🚀 Socium AI</h1>
                <p style={{ color: '#7f8c8d', fontSize: '1.2rem' }}>
                    Plataforma Inteligente de Análise de Leads do LinkedIn
                </p>
            </header>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <div style={{ 
                        backgroundColor: '#3498db', 
                        color: 'white', 
                        padding: '30px', 
                        borderRadius: '10px',
                        textAlign: 'center'
                    }}>
                        <h3>📊 Dashboard</h3>
                        <p>Visualização e gestão interativa de leads</p>
                        <Link 
                            to="/dashboard" 
                            style={{ 
                                color: 'white', 
                                textDecoration: 'none', 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                display: 'inline-block',
                                marginTop: '10px'
                            }}
                        >
                            Acessar Dashboard
                        </Link>
                    </div>

                    <div style={{ 
                        backgroundColor: '#e74c3c', 
                        color: 'white', 
                        padding: '30px', 
                        borderRadius: '10px',
                        textAlign: 'center'
                    }}>
                        <h3>🤖 Análise IA</h3>
                        <p>Classificação inteligente de oportunidades</p>
                        <Link 
                            to="/lead-analysis" 
                            style={{ 
                                color: 'white', 
                                textDecoration: 'none', 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                display: 'inline-block',
                                marginTop: '10px'
                            }}
                        >
                            Ver Análises
                        </Link>
                    </div>

                    <div style={{ 
                        backgroundColor: '#27ae60', 
                        color: 'white', 
                        padding: '30px', 
                        borderRadius: '10px',
                        textAlign: 'center'
                    }}>
                        <h3>📈 Analytics</h3>
                        <p>Métricas e insights em tempo real</p>
                        <Link 
                            to="/analytics" 
                            style={{ 
                                color: 'white', 
                                textDecoration: 'none', 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                display: 'inline-block',
                                marginTop: '10px'
                            }}
                        >
                            Ver Relatórios
                        </Link>
                    </div>
                </div>

                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '30px', 
                    borderRadius: '10px',
                    border: '1px solid #dee2e6'
                }}>
                    <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🔄 Funcionalidades</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <h4 style={{ color: '#3498db' }}>Pipeline de Dados</h4>
                            <ul style={{ color: '#555' }}>
                                <li>Upload de CSV do LinkedIn</li>
                                <li>Processamento Assíncrono</li>
                                <li>Insights Inteligentes</li>
                                <li>Dashboard Interativo</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 style={{ color: '#e74c3c' }}>Análise de IA</h4>
                            <ul style={{ color: '#555' }}>
                                <li>Classificação de Oportunidades</li>
                                <li>Pontuação Multifacetada</li>
                                <li>Insights Acionáveis</li>
                                <li>Análise de Sentimento</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;