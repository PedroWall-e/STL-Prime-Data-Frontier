import * as React from 'react';
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Heading,
    Hr,
} from '@react-email/components';

interface NewFollowerEmailProps {
    creatorName: string;
    followerName: string;
    followerUsername: string;
}

export const NewFollowerEmail: React.FC<Readonly<NewFollowerEmailProps>> = ({
    creatorName = 'Criador',
    followerName = 'Um Colega',
    followerUsername = 'novo_seguidor',
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
                        <Heading style={title}>Você tem um novo seguidor! 🎉</Heading>
                        <Text style={paragraph}>
                            Olá {creatorName},
                        </Text>
                        <Text style={paragraph}>
                            Novidades incríveis: <strong>{followerName}</strong> (@{followerUsername}) acabou de seguir o seu perfil na STL Prime.
                        </Text>
                        <Text style={paragraph}>
                            Isso significa que eles receberão notificações no Feed de Atividades sempre que você publicar um novo modelo 3D premium ou gratuito. Continue criando conteúdos incríveis!
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={button} href={`https://www.datafrontier3d.com.br/creator/${followerUsername}`}>
                                Ver Perfil de {followerName}
                            </Button>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Hr style={hr} />
                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} Data Frontier. Todos os direitos reservados.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default NewFollowerEmail;

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
    margin: '0 0 16px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0 16px',
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
    padding: '16px 32px',
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
