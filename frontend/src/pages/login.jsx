import styled from "styled-components"

const LoginContainer = styled.div`
  max-width: 20rem;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`
const Button = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`
const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`
const Logo = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
`
export default function Login() {
  return (
    <LoginContainer>
      <Logo src="/path/to/logo.png" alt="Logo" /> 
      <h1>Login</h1>
      <form>
        <Input type="text" placeholder="Usuário" />
        <Input type="password" placeholder="Senha" />
        <Button type="submit">Entrar</Button>
      </form>
    </LoginContainer>
  )
}
