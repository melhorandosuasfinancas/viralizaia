export default function ExcluirConta() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Excluir Conta</h1>
      <p className="text-gray-600 mb-8">
        Você pode solicitar a exclusão da sua conta e de todos os seus dados a qualquer momento.
      </p>

      <section className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-red-700">O que será excluído</h2>
        <ul className="list-disc pl-6 space-y-2 text-red-800">
          <li>Sua conta e dados de perfil (nome, e-mail)</li>
          <li>Histórico de vídeos processados</li>
          <li>Créditos e assinatura ativa</li>
          <li>Dados de uso e preferências</li>
        </ul>
        <p className="mt-4 text-sm text-red-700">
          <strong>Atenção:</strong> Esta ação é irreversível. Créditos e assinaturas não serão reembolsados após a exclusão.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Como solicitar a exclusão</h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold mb-2">Opção 1: Pelo app</h3>
          <ol className="list-decimal pl-6 space-y-1 text-gray-700">
            <li>Acesse o app em <a href="/app" className="text-blue-600 underline">viralizacortes.com.br/app</a></li>
            <li>Vá em Configurações &rarr; Conta</li>
            <li>Clique em &ldquo;Excluir minha conta&rdquo;</li>
            <li>Confirme a exclusão</li>
          </ol>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold mb-2">Opção 2: Por e-mail</h3>
          <p className="text-gray-700">
            Envie um e-mail para{' '}
            <a href="mailto:contato@viralizacortes.com.br?subject=Solicitação de exclusão de conta" className="text-blue-600 underline">
              contato@viralizacortes.com.br
            </a>{' '}
            com o assunto <strong>&ldquo;Solicitação de exclusão de conta&rdquo;</strong> e o e-mail cadastrado.
            Processamos a solicitação em até 7 dias úteis.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Prazo de exclusão</h2>
        <p className="text-gray-700">
          Após a confirmação, seus dados serão excluídos em até <strong>30 dias</strong>. Alguns dados podem ser
          mantidos por prazo adicional quando exigido por lei.
        </p>
      </section>

      <p className="text-sm text-gray-500">
        Dúvidas? Consulte nossa{' '}
        <a href="/privacidade" className="text-blue-600 underline">Política de Privacidade</a>
        {' '}ou entre em contato pelo e-mail acima.
      </p>
    </main>
  );
}
