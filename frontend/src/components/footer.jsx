import React from 'react';
import styled from 'styled-components';
import { FaFacebook } from "react-icons/fa";
import { RiInstagramLine } from "react-icons/ri";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
// Definição das cores baseada no seu pedido
const theme = {
  primary: '#FF6B35',
  secondary: '#2E294E',
  accent: '#1B998B',
  background: '#FFF8F5',
  text: '#2D3436',
};

const Footer = () => {
  return (
    <StyledFooter>
      <Container>
        <BrandSection>
          <Logo src="https://via.placeholder.com/40" alt="Logo" />
          <Tagline>
            Making the world a better place through constructing elegant hierarchies.
          </Tagline>
          <SocialLinks>
            <a href="#"><FaFacebook /></a>
            <a href="#"><RiInstagramLine /></a>
            <a href="#"><FaXTwitter /></a>
            <a href="#"><FaGithub /></a>
            <a href="#"><FaYoutube /></a>
          </SocialLinks>
        </BrandSection>

        <LinksGrid>
          <Column>
            <h4>Solutions</h4>
            <a href="#">Marketing</a>
            <a href="#">Analytics</a>
            <a href="#">Automation</a>
            <a href="#">Commerce</a>
            <a href="#">Insights</a>
          </Column>
          <Column>
            <h4>Support</h4>
            <a href="#">Submit ticket</a>
            <a href="#">Documentation</a>
            <a href="#">Guides</a>
          </Column>
          <Column>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Jobs</a>
            <a href="#">Press</a>
          </Column>
          <Column>
            <h4>Legal</h4>
            <a href="#">Terms of service</a>
            <a href="#">Privacy policy</a>
            <a href="#">License</a>
          </Column>
        </LinksGrid>
      </Container>

      <BottomBar>
        <p>&copy; 2024 Your Company, Inc. All rights reserved.</p>
      </BottomBar>
    </StyledFooter>
  );
};

export default Footer;

// --- Estilos com Styled Components ---

const StyledFooter = styled.footer`
  background-color: ${theme.background};
  color: ${theme.text};
  padding: 64px 24px 32px;
  font-family: sans-serif;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 48px;
`;

const BrandSection = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 320px;
`;

const Logo = styled.img`
  margin-bottom: 24px;
`;

const Tagline = styled.p`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  opacity: 0.9;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 20px;

  a {
    text-decoration: none;
    color: ${theme.text};
    font-weight: bold;
    transition: color 0.2s;

    &:hover {
      color: ${theme.accent}; // Usando a cor de acento aqui
    }
  }
`;

const LinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 60px;
  flex: 2;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: flex-start;
    gap: 40px;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  h4 {
    color: ${theme.secondary}; // Cor secundária para os títulos
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  a {
    text-decoration: none;
    color: ${theme.text};
    font-size: 14px;
    opacity: 0.8;
    transition: all 0.2s;

    &:hover {
      color: ${theme.primary}; // Cor primária no hover dos links
      opacity: 1;
      padding-left: 4px; // Um leve efeito de movimento
    }
  }
`;

const BottomBar = styled.div`
  max-width: 1200px;
  margin: 48px auto 0;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 14px;
  opacity: 0.7;
`;