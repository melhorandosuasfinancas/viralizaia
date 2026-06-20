export default function PoliticaDePrivacidade() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1>
      <p className="text-sm text-gray-500 mb-8">Última atualização: 19 de junho de 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Dados que coletamos</h2>
        <p className="mb-3">Ao usar o Viraliza Cortes, podemos coletar:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Nome:</strong> para identificar sua conta.</li>
          <li><strong>Endereço de e-mail:</strong> para autenticação e comunicação.</li>
          <li><strong>Interações no app:</strong> cliques e uso de funcionalidades, para melhoria do serviço.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Como usamos seus dados</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Autenticação e gerenciamento de conta.</li>
          <li>Processamento de vídeos e entrega dos cortes gerados.</li>
          <li>Comunicação sobre atualizações e suporte.</li>
          <li>Melhoria contínua do serviço.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Compartilhamento de dados</h2>
        <p>Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto quando exigido por lei ou necessário para a operação do serviço.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Retenção e exclusão</h2>
        <p>Seus dados são mantidos enquanto sua conta estiver ativa. Para excluir sua conta e dados, acesse <a href="/excluir-conta" className="text-blue-600 underline">viralizacortes.com.br/excluir-conta</a>.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Segurança</h2>
        <p>Utilizamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contato</h2>
        <p>Dúvidas? Entre em contato: <a href="mailto:contato@viralizacortes.com.br" className="text-blue-600 underline">contato@viralizacortes.com.br</a></p>
      </section>
    </main>
  );
}
