import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
 
const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
 
const Left = styled.div`
  background: linear-gradient(160deg, var(--secondary) 0%, #1a1640 60%, var(--accent) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 4rem;
  position: relative;
  overflow: hidden;
 
  &::before {
    content: '';
    position: absolute;
    bottom: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
 
  @media (max-width: 900px) { display: none; }
`;
 
const LeftLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 3rem;
`;
 
const LogoCircle = styled.div`
  width: 44px;
  height: 44px;
  background: var(--primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
`;
 
const LogoName = styled.span`
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  color: white;
  letter-spacing: -0.5px;
  span { color: var(--primary); }
`;
 
const LeftHeadline = styled.h1`
  font-family: 'Sora', sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  color: white;
  line-height: 1.15;
  margin-bottom: 1rem;
  letter-spacing: -1px;
 
  span { color: var(--primary); }
`;
 
const LeftSub = styled.p`
  color: rgba(255,255,255,0.6);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
  max-width: 340px;
  margin-bottom: 3rem;
`;
 
const FeatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
 
const FeatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  font-weight: 600;
 
  .icon {
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.1);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.1rem;
  }
`;
 
const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #FAFAFA;
 
  @media (max-width: 900px) {
    background: linear-gradient(180deg, var(--secondary) 30%, #FAFAFA 30%);
    align-items: flex-start;
    padding: 2rem 1.25rem;
  }
`;
 
const Card = styled.div`
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: 2.5rem 2.25rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--border);
 
  @media (max-width: 900px) {
    box-shadow: 0 16px 40px rgba(0,0,0,0.15);
  }
`;
 
const MobileLogo = styled.div`
  display: none;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.75rem;
 
  @media (max-width: 900px) { display: flex; }
 
  .icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
  h2 {
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    font-size: 1.4rem;
    color: var(--text-primary);
    letter-spacing: -0.5px;
    span { color: var(--primary); }
  }
`;
 
const CardTitle = styled.h2`
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
  letter-spacing: -0.5px;
`;
 
const CardSub = styled.p`
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 2rem;
`;
 
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
 
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
 
  label {
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--text-secondary);
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
`;
 
const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1.1rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: 'Nunito', sans-serif;
  color: var(--text-primary);
  background: var(--surface-2);
  transition: all 0.2s;
  font-weight: 600;
 
  &:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(255,107,53,0.08);
  }
 
  &::placeholder { color: var(--text-muted); font-weight: 500; }
`;
 
const ForgotLink = styled.a`
  font-size: 0.82rem;
  color: var(--primary);
  font-weight: 700;
  text-align: right;
  margin-top: -0.5rem;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;
 
const SubmitBtn = styled.button`
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.25rem;
 
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(255,107,53,0.3);
  }
 
  &:active { transform: translateY(0); }
  &:disabled { background: #ccc; cursor: not-allowed; transform: none; }
`;
 
const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.25rem 0;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 700;
 
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
`;
 
const RegisterRow = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
 
  button {
    background: none;
    border: none;
    color: var(--accent);
    font-weight: 800;
    font-size: 0.9rem;
    font-family: 'Nunito', sans-serif;
    cursor: pointer;
    margin-left: 0.3rem;
    &:hover { text-decoration: underline; }
  }
`;
 
const StoreLink = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: none;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
 
  &:hover {
    border-color: var(--secondary);
    color: var(--secondary);
    background: rgba(46,41,78,0.04);
  }
`;
 
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
 
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    login(email, 'cliente');
  };
 
  return (
    <Page>
      <Left>
        <LeftLogo>
          <LogoCircle>🍔</LogoCircle>
          <LogoName>Food<span>Express</span></LogoName>
        </LeftLogo>
        <LeftHeadline>
          Comida boa,<br />
          entregue <span>rápido</span>
        </LeftHeadline>
        <LeftSub>
          Acesse sua conta e descubra centenas de restaurantes e mercados prontos para entregar até você.
        </LeftSub>
        <FeatList>
          <FeatItem><div className="icon">🚀</div> Entrega em até 30 minutos</FeatItem>
          <FeatItem><div className="icon">🔒</div> Pagamento 100% seguro</FeatItem>
          <FeatItem><div className="icon">⭐</div> Avalie e acompanhe seus pedidos</FeatItem>
        </FeatList>
      </Left>
 
      <Right>
        <Card>
          <MobileLogo>
            <div className="icon">🍔</div>
            <h2>Food<span>Express</span></h2>
          </MobileLogo>
 
          <CardTitle>Bem-vindo de volta!</CardTitle>
          <CardSub>Entre na sua conta para continuar</CardSub>
 
          <Form onSubmit={handleSubmit}>
            <Field>
              <label>E-mail ou Telefone</label>
              <Input
                type="text"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field>
              <label>Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Field>
            <ForgotLink>Esqueceu a senha?</ForgotLink>
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </SubmitBtn>
          </Form>
 
          <Divider>ou</Divider>
 
          <RegisterRow>
            Não tem uma conta?
            <button onClick={() => navigate('/register/user')}>Cadastre-se grátis</button>
          </RegisterRow>
 
          <div style={{ marginTop: '1.25rem' }}>
            <StoreLink onClick={() => navigate('/register/store')}>
              🏪 Cadastre seu restaurante ou mercado
            </StoreLink>
          </div>
        </Card>
      </Right>
    </Page>
  );
}