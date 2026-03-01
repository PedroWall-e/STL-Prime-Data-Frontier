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
    Column,
    Row,
} from '@react-email/components';

interface ReceiptEmailProps {
    firstName: string;
    items: Array<{
        title: string;
        price: string;
        author: string;
    }>;
    total: string;
    orderId: string;
}

export const ReceiptEmail: React.FC<Readonly<ReceiptEmailProps>> = ({
    firstName = 'Membro',
    items = [],
    total = '0.00',
    orderId = '#12345',
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
                        <Heading style={title}>Pagamento Confirmado! 🎉</Heading>
                        <Text style={paragraph}>
                            Olá {firstName}, recebemos o seu pagamento referente ao pedido <strong>{orderId}</strong>.
                            Seus arquivos STL já estão disponíveis para download imediato.
                        </Text>

                        {/* Order Summary Box */}
                        <Section style={summaryBox}>
                            <Text style={summaryTitle}>Resumo do Pedido</Text>
                            <Hr style={hrLight} />

                            {items.map((item, index) => (
                                <Row key={index} style={itemRow}>
                                    <Column style={itemInfoCell}>
                                        <Text style={itemName}>{item.title}</Text>
                                        <Text style={itemSub}>por @{item.author}</Text>
                                    </Column>
                                    <Column style={itemPriceCell}>
                                        <Text style={itemPrice}>R$ {item.price}</Text>
                                    </Column>
                                </Row>
                            ))}

                            <Hr style={hrLight} />
                            <Row>
                                <Column>
                                    <Text style={totalLabel}>Total Pago:</Text>
                                </Column>
                                <Column style={itemPriceCell}>
                                    <Text style={totalValue}>R$ {total}</Text>
                                </Column>
                            </Row>
                        </Section>

                        <Section style={buttonContainer}>
                            <Button style={button} href="https://www.datafrontier3d.com.br/dashboard">
                                Acessar Meus Downloads
                            </Button>
                        </Section>

                        <Text style={paragraph}>
                            Muito obrigado por apoiar os criadores 3D na STL Prime!
                        </Text>
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

export default ReceiptEmail;

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

const summaryBox = {
    backgroundColor: '#F9F8F6',
    padding: '24px',
    borderRadius: '12px',
    margin: '24px 0',
};

const summaryTitle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 16px',
};

const itemRow = {
    width: '100%',
};

const itemInfoCell = {
    width: '75%',
    paddingBottom: '12px',
};

const itemPriceCell = {
    width: '25%',
    textAlign: 'right' as const,
    verticalAlign: 'top',
};

const itemName = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2B2B2B',
    margin: '0 0 4px',
};

const itemSub = {
    fontSize: '12px',
    color: '#a1a1aa',
    margin: '0',
};

const itemPrice = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2B2B2B',
    margin: '0',
};

const totalLabel = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2B2B2B',
    margin: '16px 0 0',
};

const totalValue = {
    fontSize: '20px',
    fontWeight: '900',
    color: '#3347FF',
    margin: '16px 0 0',
};

const hrLight = {
    borderColor: '#e5e7eb',
    margin: '16px 0',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
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
