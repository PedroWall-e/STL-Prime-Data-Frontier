import * as React from 'react';
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Img,
    Button,
    Heading,
    Hr,
} from '@react-email/components';

interface WelcomeEmailProps {
    firstName: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
    firstName = 'Membro',
}) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Text style={logoText}>STL PRIME</Text>
                    </Section>

                    {/* Content */}
                    <Section style={content}>
                        <Heading style={title}>Bem-vindo à Data Frontier, {firstName}!</Heading>
                        <Text style={paragraph}>
                            Estamos muito felizes em ter você conosco. A STL Prime é a sua nova casa para modelos 3D de alta qualidade, prontos para impressão.
                        </Text>
                        <Text style={paragraph}>
                            Aqui você pode explorar milhares de modelos premium, seguir seus criadores favoritos e até mesmo vender suas próprias criações.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={button} href="https://www.datafrontier3d.com.br">
                                Explorar Catálogo
                            </Button>
                        </Section>

                        <Text style={paragraph}>
                            Se precisar de qualquer ajuda, nossa equipe está sempre à disposição na aba Comunidade.
                        </Text>
                        <Text style={signoff}>
                            Bora imprimir! 🚀<br />
                            A Equipe STL Prime
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Hr style={hr} />
                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} Data Frontier. Todos os direitos reservados.
                        </Text>
                        <Text style={footerLinks}>
                            <a href="#" style={link}>Configurações de E-mail</a> • <a href="#" style={link}>Termos de Uso</a>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default WelcomeEmail;

// ─── STYLES ──────────────────────────────────────────────────────────────

const main = {
    backgroundColor: '#F9F8F6',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '580px',
};

const header = {
    padding: '24px',
    backgroundColor: '#3347FF',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    textAlign: 'center' as const,
};

const logoText = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '900',
    letterSpacing: '2px',
    margin: '0',
};

const content = {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const title = {
    color: '#2B2B2B',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 24px',
};

const paragraph = {
    color: '#555555',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '0 0 24px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#3347FF',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 28px',
};

const signoff = {
    color: '#2B2B2B',
    fontSize: '16px',
    fontWeight: 'bold',
    lineHeight: '26px',
    margin: '0',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const footer = {
    textAlign: 'center' as const,
    padding: '0 24px',
};

const footerText = {
    color: '#a1a1aa',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '0 0 8px',
};

const footerLinks = {
    color: '#a1a1aa',
    fontSize: '12px',
    margin: '0',
};

const link = {
    color: '#a1a1aa',
    textDecoration: 'underline',
};
