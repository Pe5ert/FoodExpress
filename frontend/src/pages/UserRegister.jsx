import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Pagina = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: #FAFAFA;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;

  @media (max-width: 600px) {
    align-items: flex-start;
    padding: 1.5rem 1rem;
  }
`

const Card = styled.div`
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: 2.5rem 2.25rem;
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--border);
`

const BotaoVoltar = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.75rem;
  transition: color 0.2s;
  &:hover { color: var(--text-primary); }
`

const AreaTopo = styled.div`
  margin-bottom: 2rem;
`

const LogoLinha = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
`

const LogoIcone = styled.div`
  width: 38px;
  height: 38px;
  background: var(--primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`

const LogoTexto = styled.span`
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  color: var(--text-primary);
  span { color: var(--primary); }
`

const Titulo = styled.h1`
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
  letter-spacing: -0.5px;
`

const Subtitulo = styled.p`
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
`

const Formulario = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--text-secondary);
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
`

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg.icone {
    position: absolute;
    left: 1rem;
    color: var(--text-muted);
    pointer-events: none;
    flex-shrink: 0;
  }

  button.toggle-senha {
    position: absolute;
    right: 0.875rem;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    &:hover { color: var(--text-primary); }
  }
`

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
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
`

const LinhaTermos = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 0.25rem;

  input[type="checkbox"] {
    margin-top: 3px;
    accent-color: var(--primary);
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    cursor: pointer;
  }

  label {
    font-size: 0.82rem;
    color: var(--text-secondary);
    font-weight: 600;
    line-height: 1.4;
    cursor: pointer;
    text-transform: none;
    letter-spacing: 0;
    a { color: var(--primary); font-weight: 700; }
  }
`

const BotaoEnviar = styled.button`
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
  margin-top: 0.5rem;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(255,107,53,0.3);
  }
  &:disabled { background: #ccc; cursor: not-allowed; transform: none; }
`

const Divisor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 700;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
`

const LinhaLogin = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-top: 1rem;

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
`

const BotaoLoja = styled.button`
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
  margin-top: 0.75rem;

  &:hover {
    border-color: var(--secondary);
    color: var(--secondary);
    background: rgba(46,41,78,0.04);
  }
`

export default function CadastroUsuario() {
  const [dados, setDados] = useState({ nome: '', email: '', telefone: '', senha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const { cadastrarCliente, signupCliente } = useAuth();
  const navigate = useNavigate();

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!aceitouTermos) return;
    setCarregando(true);
    const fn = cadastrarCliente || signupCliente;
    fn({ name: dados.nome, email: dados.email, phone: dados.telefone, password: dados.senha });
  };

  const handleChange = (e) => setDados({ ...dados, [e.target.name]: e.target.value });

  return (
    <Pagina>
      <Card>
        <BotaoVoltar onClick={() => navigate('/login')}>
          <ArrowLeft size={15} /> Voltar para login
        </BotaoVoltar>

        <AreaTopo>
          <LogoLinha>
            <LogoIcone>🍔</LogoIcone>
            <LogoTexto>Food<span>Express</span></LogoTexto>
          </LogoLinha>
          <Titulo>Criar conta</Titulo>
          <Subtitulo>Cadastre-se grátis e faça seu pedido agora</Subtitulo>
        </AreaTopo>

        <Formulario onSubmit={handleEnviar}>
          <Campo>
            <label>Nome completo</label>
            <InputWrapper>
              <User size={16} className="icone" />
              <Input name="nome" type="text" placeholder="Seu nome completo" value={dados.nome} onChange={handleChange} required />
            </InputWrapper>
          </Campo>

          <Campo>
            <label>E-mail</label>
            <InputWrapper>
              <Mail size={16} className="icone" />
              <Input name="email" type="email" placeholder="seu@email.com" value={dados.email} onChange={handleChange} required />
            </InputWrapper>
          </Campo>

          <Campo>
            <label>Telefone / WhatsApp</label>
            <InputWrapper>
              <Phone size={16} className="icone" />
              <Input name="telefone" type="tel" placeholder="(11) 99999-9999" value={dados.telefone} onChange={handleChange} required />
            </InputWrapper>
          </Campo>

          <Campo>
            <label>Senha</label>
            <InputWrapper>
              <Lock size={16} className="icone" />
              <Input
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={dados.senha}
                onChange={handleChange}
                required
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" className="toggle-senha" onClick={() => setMostrarSenha(s => !s)}>
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </InputWrapper>
          </Campo>

          <LinhaTermos>
            <input type="checkbox" id="termos" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} />
            <label htmlFor="termos">
              Li e aceito os <a href="#">Termos de Uso</a> e a <a href="#">Política de Privacidade</a>
            </label>
          </LinhaTermos>

          <BotaoEnviar type="submit" disabled={carregando || !aceitouTermos}>
            {carregando ? 'Criando conta...' : 'Criar minha conta'}
          </BotaoEnviar>
        </Formulario>

        <Divisor>já tem conta?</Divisor>
        <LinhaLogin>
          <button onClick={() => navigate('/login')}>Entrar na minha conta</button>
        </LinhaLogin>

        <BotaoLoja onClick={() => navigate('/register/store')}>
          🏪 Sou dono de restaurante ou mercado
        </BotaoLoja>
      </Card>
    </Pagina>
  );
}
