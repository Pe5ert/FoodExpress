import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, User, Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react';

const Pagina = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: #F5F5F5;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1.25rem 4rem;
`

const Wrapper = styled.div`
  width: 100%;
  max-width: 540px;
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
  margin-bottom: 1.5rem;
  transition: color 0.2s;
  &:hover { color: var(--text-primary); }
`

const Cabecalho = styled.div`
  text-align: center;
  margin-bottom: 1.75rem;
`

const LogoLinha = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
`

const LogoIcone = styled.div`
  width: 44px;
  height: 44px;
  background: var(--secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
`

const LogoTexto = styled.span`
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  color: var(--text-primary);
  span { color: var(--primary); }
`

const Titulo = styled.h1`
  font-family: 'Sora', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
  letter-spacing: -0.5px;
`

const Subtitulo = styled.p`
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
  max-width: 360px;
  margin: 0 auto;
  line-height: 1.5;
`

const ListaBeneficios = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: rgba(27,153,139,0.05);
  border: 1px solid rgba(27,153,139,0.15);
  border-radius: var(--radius-md);
`

const Beneficio = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  svg { color: var(--accent); flex-shrink: 0; }
`

const Card = styled.div`
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 2rem 2.25rem;
  border: 1px solid var(--border);
  margin-bottom: 1rem;
`

const CabecalhoSecao = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);

  .caixa-icone {
    width: 38px;
    height: 38px;
    background: ${p => p.$cor || 'var(--primary-light)'};
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${p => p.$corIcone || 'var(--primary)'};
  }

  h3 {
    font-family: 'Sora', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  p {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 600;
  }
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$colunas || '1fr'};
  gap: 1rem;

  @media (max-width: 500px) { grid-template-columns: 1fr; }
`

const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  ${p => p.$span && 'grid-column: 1 / -1;'}

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
    left: 0.9rem;
    color: var(--text-muted);
    pointer-events: none;
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
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: 'Nunito', sans-serif;
  color: var(--text-primary);
  background: var(--surface-2);
  transition: all 0.2s;
  font-weight: 600;

  &:focus {
    outline: none;
    border-color: var(--secondary);
    background: white;
    box-shadow: 0 0 0 3px rgba(46,41,78,0.06);
  }
  &::placeholder { color: var(--text-muted); font-weight: 500; }
`

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: 'Nunito', sans-serif;
  color: var(--text-primary);
  background: var(--surface-2);
  transition: all 0.2s;
  font-weight: 600;
  cursor: pointer;
  appearance: none;

  &:focus {
    outline: none;
    border-color: var(--secondary);
    background: white;
    box-shadow: 0 0 0 3px rgba(46,41,78,0.06);
  }
`

const LinhaTermos = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 0.25rem;

  input[type="checkbox"] {
    margin-top: 3px;
    accent-color: var(--secondary);
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
    a { color: var(--secondary); font-weight: 700; }
  }
`

const BotaoEnviar = styled.button`
  width: 100%;
  padding: 1rem;
  background: var(--secondary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: var(--secondary-light);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(46,41,78,0.3);
  }
  &:disabled { background: #ccc; cursor: not-allowed; transform: none; }
`

export default function CadastroLoja() {
  const [dados, setDados] = useState({
    nomeLoja: '', tipoLoja: '', enderecoLoja: '', telefoneLoja: '',
    nomeDono: '', emailDono: '', telefoneDono: '', cpfDono: '', senha: '',
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const { cadastrarGerente, signupGerente } = useAuth();
  const navigate = useNavigate();

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!aceitouTermos) return;
    setCarregando(true);
    const fn = cadastrarGerente || signupGerente;
    fn({
      storeName: dados.nomeLoja, storeAddress: dados.enderecoLoja,
      storePhone: dados.telefoneLoja, ownerName: dados.nomeDono,
      ownerEmail: dados.emailDono, ownerPhone: dados.telefoneDono, password: dados.senha,
    });
  };

  const handleChange = (e) => setDados({ ...dados, [e.target.name]: e.target.value });

  return (
    <Pagina>
      <Wrapper>
        <BotaoVoltar onClick={() => navigate('/register/user')}>
          <ArrowLeft size={15} /> Voltar
        </BotaoVoltar>

        <Cabecalho>
          <LogoLinha>
            <LogoIcone>🏪</LogoIcone>
            <LogoTexto>Food<span>Express</span></LogoTexto>
          </LogoLinha>
          <Titulo>Cadastre seu estabelecimento</Titulo>
          <Subtitulo>Alcance novos clientes e gerencie seus pedidos em um só lugar</Subtitulo>
        </Cabecalho>

        <ListaBeneficios>
          <Beneficio><CheckCircle size={16} /> Painel de controle completo e gratuito</Beneficio>
          <Beneficio><CheckCircle size={16} /> Receba pedidos online 24h por dia</Beneficio>
          <Beneficio><CheckCircle size={16} /> Relatórios de venda em tempo real</Beneficio>
        </ListaBeneficios>

        <form onSubmit={handleEnviar}>
          <Card>
            <CabecalhoSecao $cor="rgba(255,107,53,0.1)" $corIcone="var(--primary)">
              <div className="caixa-icone"><Store size={18} /></div>
              <div>
                <h3>Dados do Estabelecimento</h3>
                <p>Informações que os clientes verão</p>
              </div>
            </CabecalhoSecao>

            <Grade $colunas="1fr 1fr">
              <Campo $span>
                <label>Nome do estabelecimento *</label>
                <InputWrapper>
                  <Store size={15} className="icone" />
                  <Input name="nomeLoja" type="text" placeholder="Ex: Pizzaria do João" onChange={handleChange} required />
                </InputWrapper>
              </Campo>

              <Campo>
                <label>Tipo *</label>
                <InputWrapper>
                  <Store size={15} className="icone" />
                  <Select name="tipoLoja" onChange={handleChange} required>
                    <option value="">Selecione</option>
                    <option value="restaurante">🍽️ Restaurante</option>
                    <option value="pizzaria">🍕 Pizzaria</option>
                    <option value="lanchonete">🍔 Lanchonete</option>
                    <option value="mercado">🛒 Mercado</option>
                    <option value="farmacia">💊 Farmácia</option>
                    <option value="outros">📦 Outros</option>
                  </Select>
                </InputWrapper>
              </Campo>

              <Campo>
                <label>Telefone da loja *</label>
                <InputWrapper>
                  <Phone size={15} className="icone" />
                  <Input name="telefoneLoja" type="tel" placeholder="(11) 99999-9999" onChange={handleChange} required />
                </InputWrapper>
              </Campo>

              <Campo $span>
                <label>Endereço completo *</label>
                <InputWrapper>
                  <MapPin size={15} className="icone" />
                  <Input name="enderecoLoja" type="text" placeholder="Rua, número, bairro, cidade" onChange={handleChange} required />
                </InputWrapper>
              </Campo>
            </Grade>
          </Card>

          <Card>
            <CabecalhoSecao $cor="rgba(46,41,78,0.08)" $corIcone="var(--secondary)">
              <div className="caixa-icone"><User size={18} /></div>
              <div>
                <h3>Dados do Responsável</h3>
                <p>Informações do proprietário ou gerente</p>
              </div>
            </CabecalhoSecao>

            <Grade $colunas="1fr 1fr">
              <Campo $span>
                <label>Nome completo *</label>
                <InputWrapper>
                  <User size={15} className="icone" />
                  <Input name="nomeDono" type="text" placeholder="Seu nome completo" onChange={handleChange} required />
                </InputWrapper>
              </Campo>

              <Campo>
                <label>E-mail *</label>
                <InputWrapper>
                  <Mail size={15} className="icone" />
                  <Input name="emailDono" type="email" placeholder="seu@email.com" onChange={handleChange} required />
                </InputWrapper>
              </Campo>

              <Campo>
                <label>Telefone *</label>
                <InputWrapper>
                  <Phone size={15} className="icone" />
                  <Input name="telefoneDono" type="tel" placeholder="(11) 99999-9999" onChange={handleChange} required />
                </InputWrapper>
              </Campo>

              <Campo>
                <label>CPF *</label>
                <InputWrapper>
                  <User size={15} className="icone" />
                  <Input name="cpfDono" type="text" placeholder="000.000.000-00" onChange={handleChange} required />
                </InputWrapper>
              </Campo>

              <Campo>
                <label>Senha de acesso *</label>
                <InputWrapper>
                  <Lock size={15} className="icone" />
                  <Input
                    name="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    onChange={handleChange}
                    required
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button type="button" className="toggle-senha" onClick={() => setMostrarSenha(s => !s)}>
                    {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </InputWrapper>
              </Campo>
            </Grade>

            <LinhaTermos style={{ marginTop: '1.25rem' }}>
              <input type="checkbox" id="termos-loja" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} />
              <label htmlFor="termos-loja">
                Concordo com os <a href="#">Termos para Parceiros</a> e autorizo o processamento dos meus dados conforme a <a href="#">Política de Privacidade</a>
              </label>
            </LinhaTermos>

            <BotaoEnviar type="submit" disabled={carregando || !aceitouTermos} style={{ marginTop: '1.5rem' }}>
              {carregando ? 'Cadastrando...' : (<>Cadastrar estabelecimento <ChevronRight size={18} /></>)}
            </BotaoEnviar>
          </Card>
        </form>
      </Wrapper>
    </Pagina>
  );
}
