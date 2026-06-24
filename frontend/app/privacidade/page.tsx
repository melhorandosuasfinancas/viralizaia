import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Saiba como o Viraliza Cortes coleta, usa e protege seus dados pessoais.",
  alternates: {
    canonical: "https://viralizacortes.com.br/privacidade",
  },
  robots: { index: true, follow: true },
};

export default function PoliticaDePrivacidade() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
      <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
      <p className="text-sm text-gray-400 mb-2">Aplicativo: <strong>Viraliza Cortes</strong></p>
      <p className="text-sm text-gray-400 mb-8">Última atualização: 23 de junho de 2026</p>

      <p className="mb-8 text-gray-300">
        Esta Política de Privacidade descreve como o <strong>Viraliza Cortes</strong>{" "}
        (<a href="https://viralizacortes.com.br" className="text-purple-400 underline">viralizacortes.com.br</a>) coleta,
        usa, armazena e protege as informações pessoais dos usuários do aplicativo móvel e da plataforma web.
        Ao usar nosso serviço, você concorda com as práticas descritas nesta política.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Informações que coletamos</h2>
        <p className="mb-3 text-gray-300">Ao usar o Viraliza Cortes, coletamos as seguintes informações:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-300">
          <li><strong>Nome completo:</strong> fornecido no cadastro ou obtido via login com Google, usado para identificar sua conta.</li>
          <li><strong>Endereço de e-mail:</strong> usado para autenticação, comunicação e suporte.</li>
          <li><strong>Foto de perfil (opcional):</strong> obtida via login com Google, exibida no aplicativo.</li>
          <li><strong>URLs de vídeos do YouTube:</strong> inseridas pelo usuário para processamento de cortes virais.</li>
          <li><strong>Dados de uso:</strong> interações com o aplicativo (funcionalidades usadas, frequência de acesso) para melhoria do serviço.</li>
          <li><strong>Dados do dispositivo:</strong> sistema operacional e versão do app, para suporte técnico.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Como usamos suas informações</h2>
        <p className="mb-3 text-gray-300">Usamos suas informações para:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-300">
          <li>Criar e gerenciar sua conta de usuário.</li>
          <li>Processar vídeos do YouTube e gerar cortes virais automaticamente com IA.</li>
          <li>Enviar notificações sobre o status do processamento dos seus vídeos.</li>
          <li>Comunicar atualizações, novidades e informações de suporte.</li>
          <li>Melhorar continuamente a qualidade e os recursos do serviço.</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Base legal para o tratamento (LGPD)</h2>
        <p className="mb-3 text-gray-300">
          O tratamento dos seus dados pessoais é realizado com base na <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>,
          especificamente com fundamento em:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-300">
          <li><strong>Consentimento (Art. 7º, I):</strong> ao criar sua conta, você consente com o tratamento dos dados para as finalidades descritas.</li>
          <li><strong>Execução de contrato (Art. 7º, V):</strong> para prestar os serviços contratados (geração de cortes virais).</li>
          <li><strong>Legítimo interesse (Art. 7º, IX):</strong> para melhoria do serviço e segurança da plataforma.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Login com Google (Google Sign-In)</h2>
        <p className="text-gray-300">
          Oferecemos autenticação via Google Sign-In. Ao usar esta funcionalidade, a Google fornece ao Viraliza Cortes
          seu nome, e-mail e foto de perfil públicos. Não recebemos sua senha do Google. O uso dos dados recebidos
          do Google está sujeito também à{" "}
          <a href="https://policies.google.com/privacy" className="text-purple-400 underline" target="_blank" rel="noopener noreferrer">
            Política de Privacidade do Google
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Compartilhamento de dados</h2>
        <p className="mb-3 text-gray-300">
          <strong>Não vendemos seus dados pessoais.</strong> Compartilhamos informações apenas nas seguintes situações:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-300">
          <li><strong>Provedores de serviço:</strong> empresas que nos auxiliam na operação da plataforma (infraestrutura em nuvem, processamento de vídeos), vinculadas por acordos de confidencialidade.</li>
          <li><strong>Obrigação legal:</strong> quando exigido por lei, ordem judicial ou autoridade competente.</li>
          <li><strong>Proteção de direitos:</strong> para proteger os direitos, propriedade ou segurança do Viraliza Cortes e seus usuários.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Retenção de dados</h2>
        <p className="text-gray-300">
          Seus dados pessoais são mantidos enquanto sua conta estiver ativa. Os vídeos processados e cortes gerados
          ficam disponíveis por até 30 dias após o processamento. Após a exclusão da conta, seus dados são removidos
          dos nossos sistemas em até 30 dias, salvo obrigação legal de retenção.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Seus direitos (LGPD)</h2>
        <p className="mb-3 text-gray-300">Como titular de dados pessoais, você tem o direito de:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-300">
          <li>Confirmar a existência de tratamento dos seus dados.</li>
          <li>Acessar os dados que temos sobre você.</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
          <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
          <li>Solicitar a portabilidade dos dados.</li>
          <li>Revogar o consentimento a qualquer momento.</li>
          <li><strong>Excluir sua conta e todos os dados associados</strong> acessando:{" "}
            <a href="/excluir-conta" className="text-purple-400 underline">viralizacortes.com.br/excluir-conta</a>.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Segurança</h2>
        <p className="text-gray-300">
          Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado,
          alteração, divulgação ou destruição. Isso inclui criptografia em trânsito (HTTPS/TLS), autenticação
          segura e controle de acesso restrito aos sistemas internos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Crianças e adolescentes</h2>
        <p className="text-gray-300">
          O Viraliza Cortes não é direcionado a menores de 13 anos e não coleta intencionalmente dados pessoais
          de crianças. Se identificarmos que coletamos dados de um menor sem consentimento dos responsáveis,
          removeremos essas informações imediatamente.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Alterações nesta política</h2>
        <p className="text-gray-300">
          Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas
          por e-mail ou por aviso em destaque no aplicativo. O uso continuado do serviço após a notificação
          constitui aceitação das mudanças.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Contato e encarregado de dados (DPO)</h2>
        <p className="text-gray-300">
          Para exercer seus direitos, esclarecer dúvidas ou apresentar reclamações relacionadas à privacidade,
          entre em contato:
        </p>
        <ul className="list-none mt-3 space-y-1 text-gray-300">
          <li>📧 <strong>E-mail:</strong> <a href="mailto:contato@viralizacortes.com.br" className="text-purple-400 underline">contato@viralizacortes.com.br</a></li>
          <li>🌐 <strong>Site:</strong> <a href="https://viralizacortes.com.br" className="text-purple-400 underline">viralizacortes.com.br</a></li>
        </ul>
      </section>
    </main>
  );
}
