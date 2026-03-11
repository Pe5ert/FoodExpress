import { useState } from "react"
import styled from "styled-components"

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF8F5;
  padding: 2rem;
`

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(46, 41, 78, 0.12);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(46, 41, 78, 0.08);
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 2rem;
    color: #FF6B35;
    margin-bottom: 0.25rem;
  }

  span {
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #2E294E;
    opacity: 0.7;
  }
`

const Title = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #2D3436;
  text-align: center;
  margin-bottom: 1.5rem;
`

const RoleSelector = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`

const RoleButton = styled.button`
  flex: 1;
  padding: 0.75rem 0.5rem;
  border: 2px solid ${props => props.$active ? '#FF6B35' : '#e0e0e0'};
  background-color: ${props => props.$active ? '#FFF8F5' : 'white'};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    border-color: #FF6B35;
    background-color: #FFF8F5;
  }

  .icon {
    font-size: 1.5rem;
  }

  span {
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${props => props.$active ? '#FF6B35' : '#2D3436'};
  }

  &.cliente {
    ${props => props.$active && `
      background-color: rgba(255, 107, 53, 0.1);
    `}
  }

  &.gerente {
    ${props => props.$active && `
      background-color: rgba(46, 41, 78, 0.1);
    `}
  }

  &.funcionario {
    ${props => props.$active && `
      background-color: rgba(27, 153, 139, 0.1);
    `}
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #2D3436;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #2D3436;
  transition: all 0.3s ease;
  background-color: #fafafa;

  &:focus {
    outline: none;
    border-color: #FF6B35;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
  }

  &::placeholder {
    color: #a0a0a0;
  }
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #FF6B35;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;

  &:hover {
    background-color: #e55a2b;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #e0e0e0;
  }

  span {
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    color: #a0a0a0;
  }
`

const RoleDescription = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #2E294E;
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  line-height: 1.5;
`

export default function Login() {
  const [role, setRole] = useState("cliente")

  const getRoleDescription = () => {
    switch (role) {
      case "cliente":
        return "Faça pedidos dos seus restaurantes e mercados favoritos!"
      case "gerente":
        return "Gerencie seu restaurante, pedidos e cardápio."
      case "funcionario":
        return "Entregue pedidos e acompanhe suas entregas."
      default:
        return ""
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would handle authentication
    console.log("Login attempt with role:", role)
  }

  return (
    <PageContainer>
      <LoginCard>
        <Logo>
          <h1>FoodExpress</h1>
          <span>Delivered with love</span>
        </Logo>

        <Title>Entrar</Title>

        <RoleSelector>
          <RoleButton 
            type="button"
            className="cliente"
            $active={role === "cliente"} 
            onClick={() => setRole("cliente")}
          >
            <span className="icon">🍽️</span>
            <span>Cliente</span>
          </RoleButton>
          <RoleButton 
            type="button"
            className="gerente"
            $active={role === "gerente"} 
            onClick={() => setRole("gerente")}
          >
            <span className="icon">👨‍💼</span>
            <span>Gerente</span>
          </RoleButton>
          <RoleButton 
            type="button"
            className="funcionario"
            $active={role === "funcionario"} 
            onClick={() => setRole("funcionario")}
          >
            <span className="icon">🛵</span>
            <span>Entregador</span>
          </RoleButton>
        </RoleSelector>

        <RoleDescription>
          {getRoleDescription()}
        </RoleDescription>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label htmlFor="email">E-mail ou Telefone</label>
            <Input 
              id="email" 
              type="text" 
              placeholder="seu@email.com" 
            />
          </InputGroup>

          <InputGroup>
            <label htmlFor="password">Senha</label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
            />
          </InputGroup>

          <SubmitButton type="submit">
            Entrar
          </SubmitButton>
        </Form>

        <Divider>
          <span>ou</span>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <a 
            href="#" 
            style={{ 
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem', 
              color: '#FF6B35',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Esqueceu sua senha?
          </a>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.9rem',
          color: '#2D3436'
        }}>
          Não tem uma conta? {' '}
          <a 
            href="#" 
            style={{ 
              color: '#1B998B',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Cadastre-se
          </a>
        </div>
      </LoginCard>
    </PageContainer>
  )
}

