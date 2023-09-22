import{_ as e,o,c as s,O as a}from"./chunks/framework.43781440.js";const v=JSON.parse('{"title":"Guias de módulo","description":"","frontmatter":{},"headers":[],"relativePath":"pt_BR/guide/module.md","filePath":"pt_BR/guide/module.md"}'),n={name:"pt_BR/guide/module.md"},t=a(`<h1 id="guias-de-modulo" tabindex="-1">Guias de módulo <a class="header-anchor" href="#guias-de-modulo" aria-label="Permalink to &quot;Guias de módulo&quot;">​</a></h1><p>O KernelSU fornece um mecanismo de módulo que consegue modificar o diretório do sistema enquanto mantém a integridade da partição do sistema. Este mecanismo é comumente conhecido como &quot;sem sistema&quot;.</p><p>O mecanismo de módulo do KernelSU é quase o mesmo do Magisk. Se você está familiarizado com o desenvolvimento de módulos Magisk, o desenvolvimento de módulos KernelSU é muito semelhante. Você pode pular a introdução dos módulos abaixo e só precisa ler <a href="./difference-with-magisk.html">Diferença com Magisk</a>.</p><h2 id="busybox" tabindex="-1">Busybox <a class="header-anchor" href="#busybox" aria-label="Permalink to &quot;Busybox&quot;">​</a></h2><p>O KernelSU vem com um recurso binário BusyBox completo (incluindo suporte completo ao SELinux). O executável está localizado em <code>/data/adb/ksu/bin/busybox</code>. O BusyBox do KernelSU suporta o &quot;ASH Standalone Shell Mode&quot; alternável em tempo de execução. O que este modo autônomo significa é que ao executar no shell <code>ash</code> do BusyBox, cada comando usará diretamente o miniaplicativo dentro do BusyBox, independentemente do que estiver definido como <code>PATH</code>. Por exemplo, comandos como <code>ls</code>, <code>rm</code>, <code>chmod</code> <strong>NÃO</strong> usarão o que está em <code>PATH</code> (no caso do Android por padrão será <code>/system/bin/ls</code>, <code>/system/bin/rm</code> e <code>/system/bin/chmod</code> respectivamente), mas em vez disso chamará diretamente os miniaplicativos internos do BusyBox. Isso garante que os scripts sempre sejam executados em um ambiente previsível e sempre tenham o conjunto completo de comandos, independentemente da versão do Android em que estão sendo executados. Para forçar um comando a <em>não</em> usar o BusyBox, você deve chamar o executável com caminhos completos.</p><p>Cada script de shell executado no contexto do KernelSU será executado no shell <code>ash</code> do BusyBox com o modo autônomo ativado. Para o que é relevante para desenvolvedores terceirizados, isso inclui todos os scripts de inicialização e scripts de instalação de módulos.</p><p>Para aqueles que desejam usar este recurso “Modo Autônomo” fora do KernelSU, existem 2 maneiras de ativá-los:</p><ol><li>Defina a variável de ambiente <code>ASH_STANDALONE</code> como <code>1</code><br>Exemplo: <code>ASH_STANDALONE=1 /data/adb/ksu/bin/busybox sh &lt;script&gt;</code></li><li>Alternar com opções de linha de comando:<br><code>/data/adb/ksu/bin/busybox sh -o standalone &lt;script&gt;</code></li></ol><p>Para garantir que todos os shells <code>sh</code> subsequentes executados também sejam executados em modo autônomo, a opção 1 é o método preferido (e é isso que o KernelSU e o gerenciador KernelSU usam internamente), pois as variáveis ​​de ambiente são herdadas para os subprocesso.</p><div class="tip custom-block"><p class="custom-block-title">Diferença com Magisk</p><p>O BusyBox do KernelSU agora está usando o arquivo binário compilado diretamente do projeto Magisk. <strong>Obrigado ao Magisk!</strong> Portanto, você não precisa se preocupar com problemas de compatibilidade entre scripts BusyBox no Magisk e KernelSU porque eles são exatamente iguais!</p></div><h2 id="modulos-kernelsu" tabindex="-1">Módulos KernelSU <a class="header-anchor" href="#modulos-kernelsu" aria-label="Permalink to &quot;Módulos KernelSU&quot;">​</a></h2><p>Um módulo KernelSU é uma pasta colocada em <code>/data/adb/modules</code> com a estrutura abaixo:</p><div class="language-txt"><button title="Copy Code" class="copy"></button><span class="lang">txt</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">/data/adb/modules</span></span>
<span class="line"><span style="color:#A6ACCD;">├── .</span></span>
<span class="line"><span style="color:#A6ACCD;">├── .</span></span>
<span class="line"><span style="color:#A6ACCD;">|</span></span>
<span class="line"><span style="color:#A6ACCD;">├── $MODID                  &lt;--- A pasta é nomeada com o ID do módulo</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │      *** Identidade do Módulo ***</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── module.prop         &lt;--- Este arquivo armazena os metadados do módulo</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │      *** Conteúdo Principal ***</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── system              &lt;--- Esta pasta será montada se skip_mount não existir</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │   ├── ...</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │   ├── ...</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │   └── ...</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │      *** Sinalizadores de Status ***</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── skip_mount          &lt;--- Se existir, o KernelSU NÃO montará sua pasta de sistema</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── disable             &lt;--- Se existir, o módulo será desabilitado</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── remove              &lt;--- Se existir, o módulo será removido na próxima reinicialização</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │      *** Arquivos Opcionais ***</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── post-fs-data.sh     &lt;--- Este script será executado em post-fs-data</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── post-mount.sh       &lt;--- Este script será executado em post-mount</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── service.sh          &lt;--- Este script será executado no late_start service</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── boot-completed.sh   &lt;--- Este script será executado na inicialização concluída</span></span>
<span class="line"><span style="color:#A6ACCD;">|   ├── uninstall.sh        &lt;--- Este script será executado quando o KernelSU remover seu módulo</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── system.prop         &lt;--- As propriedades neste arquivo serão carregadas como propriedades do sistema por resetprop</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── sepolicy.rule       &lt;--- Regras adicionais de sepolicy personalizadas</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │      *** Gerado Automaticamente, NÃO CRIE OU MODIFIQUE MANUALMENTE ***</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── vendor              &lt;--- Um link simbólico para $MODID/system/vendor</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── product             &lt;--- Um link simbólico para $MODID/system/product</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── system_ext          &lt;--- Um link simbólico para $MODID/system/system_ext</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │      *** Quaisquer arquivos/pastas adicionais são permitidos ***</span></span>
<span class="line"><span style="color:#A6ACCD;">│   │</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── ...</span></span>
<span class="line"><span style="color:#A6ACCD;">│   └── ...</span></span>
<span class="line"><span style="color:#A6ACCD;">|</span></span>
<span class="line"><span style="color:#A6ACCD;">├── another_module</span></span>
<span class="line"><span style="color:#A6ACCD;">│   ├── .</span></span>
<span class="line"><span style="color:#A6ACCD;">│   └── .</span></span>
<span class="line"><span style="color:#A6ACCD;">├── .</span></span>
<span class="line"><span style="color:#A6ACCD;">├── .</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">Diferença com Magisk</p><p>O KernelSU não possui suporte integrado para o Zygisk, portanto não há conteúdo relacionado ao Zygisk no módulo. No entanto, você pode usar <a href="https://github.com/Dr-TSNG/ZygiskOnKernelSU" target="_blank" rel="noreferrer">ZygiskOnKernelSU</a> para suportar módulos Zygisk. Neste caso, o conteúdo do módulo Zygisk é idêntico ao suportado pelo Magisk.</p></div><h3 id="module-prop" tabindex="-1">module.prop <a class="header-anchor" href="#module-prop" aria-label="Permalink to &quot;module.prop&quot;">​</a></h3><p>module.prop é um arquivo de configuração para um módulo. No KernelSU, se um módulo não contiver este arquivo, ele não será reconhecido como um módulo. O formato deste arquivo é o seguinte:</p><div class="language-txt"><button title="Copy Code" class="copy"></button><span class="lang">txt</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">id=&lt;string&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">name=&lt;string&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">version=&lt;string&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">versionCode=&lt;int&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">author=&lt;string&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">description=&lt;string&gt;</span></span></code></pre></div><ul><li><code>id</code> deve corresponder a esta expressão regular: <code>^[a-zA-Z][a-zA-Z0-9._-]+$</code><br> ex: ✓ <code>a_module</code>, ✓ <code>a.module</code>, ✓ <code>module-101</code>, ✗ <code>a module</code>, ✗ <code>1_module</code>, ✗ <code>-a-module</code><br> Este é o <strong>identificador exclusivo</strong> do seu módulo. Você não deve alterá-lo depois de publicado.</li><li><code>versionCode</code> deve ser um <strong>inteiro</strong>. Isso é usado para comparar versões</li><li>Outros que não foram mencionados acima podem ser qualquer string de <strong>linha única</strong>.</li><li>Certifique-se de usar o tipo de quebra de linha <code>UNIX (LF)</code> e não o <code>Windows (CR+LF)</code> ou <code>Macintosh (CR)</code>.</li></ul><h3 id="shell-scripts" tabindex="-1">Shell scripts <a class="header-anchor" href="#shell-scripts" aria-label="Permalink to &quot;Shell scripts&quot;">​</a></h3><p>Por favor, leia a seção <a href="#boot-scripts">Scripts de inicialização</a> para entender a diferença entre <code>post-fs-data.sh</code> e <code>service.sh</code>. Para a maioria dos desenvolvedores de módulos, <code>service.sh</code> deve ser bom o suficiente se você precisar apenas executar um script de inicialização. Se precisar executar o script após a inicialização ser concluída, use <code>boot-completed.sh</code>. Se você quiser fazer algo após montar overlayfs, use <code>post-mount.sh</code>.</p><p>Em todos os scripts do seu módulo, use <code>MODDIR=\${0%/*}</code> para obter o caminho do diretório base do seu módulo; <strong>NÃO</strong> codifique o caminho do seu módulo em scripts.</p><div class="tip custom-block"><p class="custom-block-title">Diferença com Magisk</p><p>Você pode usar a variável de ambiente <code>KSU</code> para determinar se um script está sendo executado no KernelSU ou Magisk. Se estiver executando em KernelSU, esse valor será definido como <code>true</code>.</p></div><h3 id="diretorio-system" tabindex="-1">Diretório <code>system</code> <a class="header-anchor" href="#diretorio-system" aria-label="Permalink to &quot;Diretório \`system\`&quot;">​</a></h3><p>O conteúdo deste diretório será sobreposto à partição /system do sistema usando overlayfs após a inicialização do sistema. Isso significa que:</p><ol><li>Arquivos com o mesmo nome daqueles no diretório correspondente no sistema serão substituídos pelos arquivos deste diretório.</li><li>Pastas com o mesmo nome daquelas no diretório correspondente no sistema serão mescladas com as pastas neste diretório.</li></ol><p>Se você deseja excluir um arquivo ou pasta no diretório original do sistema, você precisa criar um arquivo com o mesmo nome do arquivo/pasta no diretório do módulo usando <code>mknod filename c 0 0</code>. Dessa forma, o sistema overlayfs irá automaticamente &quot;branquear&quot; este arquivo como se ele tivesse sido excluído (a partição /system não foi realmente alterada).</p><p>Você também pode declarar uma variável chamada <code>REMOVE</code> contendo uma lista de diretórios em <code>customize.sh</code> para executar operações de remoção, e o KernelSU executará automaticamente <code>mknod &lt;TARGET&gt; c 0 0</code> nos diretórios correspondentes do módulo. Por exemplo:</p><div class="language-sh"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">REMOVE</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#C3E88D;">/system/app/YouTube</span></span>
<span class="line"><span style="color:#C3E88D;">/system/app/Bloatware</span></span>
<span class="line"><span style="color:#89DDFF;">&quot;</span></span></code></pre></div><p>A lista acima irá executar <code>mknod $MODPATH/system/app/YouTube c 0 0</code> e <code>mknod $MODPATH/system/app/Bloatware c 0 0</code>; e <code>/system/app/YouTube</code> e <code>/system/app/Bloatware</code> serão removidos após o módulo entrar em vigor.</p><p>Se você deseja substituir um diretório no sistema, você precisa criar um diretório com o mesmo caminho no diretório do módulo e, em seguida, definir o atributo <code>setfattr -n trusted.overlay.opaque -v y &lt;TARGET&gt;</code> para este diretório. Desta forma, o sistema overlayfs substituirá automaticamente o diretório correspondente no sistema (sem alterar a partição /system).</p><p>Você pode declarar uma variável chamada <code>REPLACE</code> em seu arquivo <code>customize.sh</code>, que inclui uma lista de diretórios a serem substituídos, e o KernelSU executará automaticamente as operações correspondentes em seu diretório de módulo. Por exemplo:</p><div class="language-sh"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">REPLACE</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#C3E88D;">/system/app/YouTube</span></span>
<span class="line"><span style="color:#C3E88D;">/system/app/Bloatware</span></span>
<span class="line"><span style="color:#89DDFF;">&quot;</span></span></code></pre></div><p>Esta lista criará automaticamente os diretórios <code>$MODPATH/system/app/YouTube</code> e <code>$MODPATH/system/app/Bloatware</code> e, em seguida, executará <code>setfattr -n trusted.overlay.opaque -v y $MODPATH/system/app/YouTube</code> e <code>setfattr -n trusted.overlay.opaque -v y $MODPATH/system/app/Bloatware</code>. Após o módulo entrar em vigor, <code>/system/app/YouTube</code> e <code>/system/app/Bloatware</code> serão substituídos por diretórios vazios.</p><div class="tip custom-block"><p class="custom-block-title">Diferença com Magisk</p><p>O mecanismo sem sistema do KernelSU é implementado através do overlayfs do kernel, enquanto o Magisk atualmente usa montagem mágica (montagem de ligação). Os dois métodos de implementação têm diferenças significativas, mas o objetivo final é o mesmo: modificar os arquivos /system sem modificar fisicamente a partição /system.</p></div><p>Se você estiver interessado em overlayfs, é recomendável ler a <a href="https://docs.kernel.org/filesystems/overlayfs.html" target="_blank" rel="noreferrer">documentação sobre overlayfs do Kernel Linux</a>.</p><h3 id="system-prop" tabindex="-1">system.prop <a class="header-anchor" href="#system-prop" aria-label="Permalink to &quot;system.prop&quot;">​</a></h3><p>Este arquivo segue o mesmo formato de <code>build.prop</code>. Cada linha é composta por <code>[key]=[value]</code>.</p><h3 id="sepolicy-rule" tabindex="-1">sepolicy.rule <a class="header-anchor" href="#sepolicy-rule" aria-label="Permalink to &quot;sepolicy.rule&quot;">​</a></h3><p>Se o seu módulo exigir alguns patches adicionais de sepolicy, adicione essas regras a este arquivo. Cada linha neste arquivo será tratada como uma declaração de política.</p><h2 id="instalador-de-modulo" tabindex="-1">Instalador de módulo <a class="header-anchor" href="#instalador-de-modulo" aria-label="Permalink to &quot;Instalador de módulo&quot;">​</a></h2><p>Um instalador de módulo KernelSU é um módulo KernelSU empacotado em um arquivo zip que pode ser atualizado no app gerenciador KernelSU. O instalador de módulo KernelSU mais simples é apenas um módulo KernelSU compactado como um arquivo zip.</p><div class="language-txt"><button title="Copy Code" class="copy"></button><span class="lang">txt</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">module.zip</span></span>
<span class="line"><span style="color:#A6ACCD;">│</span></span>
<span class="line"><span style="color:#A6ACCD;">├── customize.sh                       &lt;--- (Opcional, mais detalhes posteriormente)</span></span>
<span class="line"><span style="color:#A6ACCD;">│                                           Este script será fornecido por update-binary</span></span>
<span class="line"><span style="color:#A6ACCD;">├── ...</span></span>
<span class="line"><span style="color:#A6ACCD;">├── ...  /* O resto dos arquivos do módulo */</span></span>
<span class="line"><span style="color:#A6ACCD;">│</span></span></code></pre></div><p>:::aviso O módulo KernelSU <strong>NÃO</strong> é compatível para instalação no recovery personalizado! :::</p><h3 id="costumizacao" tabindex="-1">Costumização <a class="header-anchor" href="#costumizacao" aria-label="Permalink to &quot;Costumização&quot;">​</a></h3><p>Se você precisar personalizar o processo de instalação do módulo, opcionalmente você pode criar um script no instalador chamado <code>customize.sh</code>. Este script será <em>sourced</em> (não executado!) pelo script do instalador do módulo depois que todos os arquivos forem extraídos e as permissões padrão e o contexto secundário forem aplicados. Isso é muito útil se o seu módulo exigir configuração adicional com base na ABI do dispositivo ou se você precisar definir permissões/segundo contexto especiais para alguns dos arquivos do seu módulo.</p><p>Se você quiser controlar e personalizar totalmente o processo de instalação, declare <code>SKIPUNZIP=1</code> em <code>customize.sh</code> para pular todas as etapas de instalação padrão. Ao fazer isso, seu <code>customize.sh</code> será responsável por instalar tudo sozinho.</p><p>O script <code>customize.sh</code> é executado no shell BusyBox <code>ash</code> do KernelSU com o &quot;Modo Autônomo&quot; ativado. As seguintes variáveis ​​e funções estão disponíveis:</p><h4 id="variaveis" tabindex="-1">Variáveis <a class="header-anchor" href="#variaveis" aria-label="Permalink to &quot;Variáveis&quot;">​</a></h4><ul><li><code>KSU</code> (bool): uma variável para marcar que o script está sendo executado no ambiente KernelSU, e o valor desta variável sempre será true. Você pode usá-lo para distinguir entre KernelSU e Magisk.</li><li><code>KSU_VER</code> (string): a string da versão do KernelSU atualmente instalado (por exemplo, <code>v0.4.0</code>)</li><li><code>KSU_VER_CODE</code> (int): o código da versão do KernelSU atualmente instalado no espaço do usuário (por exemplo, <code>10672</code>)</li><li><code>KSU_KERNEL_VER_CODE</code> (int): o código da versão do KernelSU atualmente instalado no espaço do kernel (por exemplo, <code>10672</code>)</li><li><code>BOOTMODE</code> (bool): sempre seja <code>true</code> no KernelSU</li><li><code>MODPATH</code> (path): o caminho onde os arquivos do seu módulo devem ser instalados</li><li><code>TMPDIR</code> (path): um lugar onde você pode armazenar arquivos temporariamente</li><li><code>ZIPFILE</code> (path): zip de instalação do seu módulo</li><li><code>ARCH</code> (string): a arquitetura da CPU do dispositivo. O valor é <code>arm</code>, <code>arm64</code>, <code>x86</code> ou <code>x64</code></li><li><code>IS64BIT</code> (bool): <code>true</code> se <code>$ARCH</code> for <code>arm64</code> ou <code>x64</code></li><li><code>API</code> (int): o nível da API (versão do Android) do dispositivo (por exemplo, <code>23</code> para Android 6.0)</li></ul><p>::: aviso No KernelSU, <code>MAGISK_VER_CODE</code> é sempre <code>25200</code> e <code>MAGISK_VER</code> é sempre <code>v25.2</code>. Por favor, não use essas duas variáveis ​​para determinar se ele está sendo executado no KernelSU ou não. :::</p><h4 id="funcoes" tabindex="-1">Funções <a class="header-anchor" href="#funcoes" aria-label="Permalink to &quot;Funções&quot;">​</a></h4><div class="language-txt"><button title="Copy Code" class="copy"></button><span class="lang">txt</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ui_print &lt;msg&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    imprima &lt;msg&gt; no console</span></span>
<span class="line"><span style="color:#A6ACCD;">    Evite usar &#39;echo&#39;, pois ele não será exibido no console de recuperação personalizado</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">abort &lt;msg&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">    imprima mensagem de erro &lt;msg&gt; para consolar e encerrar a instalação</span></span>
<span class="line"><span style="color:#A6ACCD;">    Evite usar &#39;exit&#39;, pois isso irá pular as etapas de limpeza de encerramento</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">set_perm &lt;target&gt; &lt;owner&gt; &lt;group&gt; &lt;permission&gt; [context]</span></span>
<span class="line"><span style="color:#A6ACCD;">    se [context] não estiver definido, o padrão é &quot;u:object_r:system_file:s0&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    esta função é uma abreviação para os seguintes comandos:</span></span>
<span class="line"><span style="color:#A6ACCD;">       chown owner.group target</span></span>
<span class="line"><span style="color:#A6ACCD;">       chmod permission target</span></span>
<span class="line"><span style="color:#A6ACCD;">       chcon context target</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">set_perm_recursive &lt;directory&gt; &lt;owner&gt; &lt;group&gt; &lt;dirpermission&gt; &lt;filepermission&gt; [context]</span></span>
<span class="line"><span style="color:#A6ACCD;">    se [context] não está definido, o padrão é &quot;u:object_r:system_file:s0&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    para todos os arquivos em &lt;directory&gt;, ele chamará:</span></span>
<span class="line"><span style="color:#A6ACCD;">       contexto de permissão de arquivo do grupo proprietário do arquivo set_perm</span></span>
<span class="line"><span style="color:#A6ACCD;">    para todos os diretórios em &lt;directory&gt; (including itself), ele vai ligar:</span></span>
<span class="line"><span style="color:#A6ACCD;">       set_perm dir owner group dirpermission context</span></span></code></pre></div><h2 id="scripts-de-inicializacao" tabindex="-1">Scripts de inicialização <a class="header-anchor" href="#scripts-de-inicializacao" aria-label="Permalink to &quot;Scripts de inicialização&quot;">​</a></h2><p>No KernelSU, os scripts são divididos em dois tipos com base em seu modo de execução: modo post-fs-data e modo de serviço late_start:</p><ul><li>modo post-fs-data <ul><li>Esta etapa está BLOQUEANDO. O processo de inicialização é pausado antes da execução ser concluída ou 10 segundos se passaram.</li><li>Os scripts são executados antes de qualquer módulo ser montado. Isso permite que um desenvolvedor de módulo ajuste dinamicamente seus módulos antes de serem montados.</li><li>Este estágio acontece antes do início do Zygote, o que significa praticamente tudo no Android</li><li><strong>AVISO:</strong> usar <code>setprop</code> irá bloquear o processo de inicialização! Por favor, use <code>resetprop -n &lt;prop_name&gt; &lt;prop_value&gt;</code> em vez disso.</li><li><strong>Execute scripts neste modo apenas se necessário.</strong></li></ul></li><li>modo de serviço late_start <ul><li>Esta etapa é SEM BLOQUEIO. Seu script é executado em paralelo com o restante do processo de inicialização.</li><li><strong>Este é o estágio recomendado para executar a maioria dos scripts.</strong></li></ul></li></ul><p>No KernelSU, os scripts de inicialização são divididos em dois tipos com base no local de armazenamento: scripts gerais e scripts de módulo:</p><ul><li>Scripts gerais <ul><li>Colocado em <code>/data/adb/post-fs-data.d</code>, <code>/data/adb/service.d</code>, <code>/data/adb/post-mount.d</code> ou <code>/data/adb/boot-completed.d</code></li><li>Somente executado se o script estiver definido como executável (<code>chmod +x script.sh</code>)</li><li>Os scripts em <code>post-fs-data.d</code> são executados no modo post-fs-data e os scripts em <code>service.d</code> são executados no modo de serviço late_start.</li><li>Os módulos <strong>NÃO</strong> devem adicionar scripts gerais durante a instalação</li></ul></li><li>Scripts de módulo <ul><li>Colocado na própria pasta do módulo</li><li>Executado apenas se o módulo estiver ativado</li><li><code>post-fs-data.sh</code> é executado no modo post-fs-data, <code>service.sh</code> é executado no modo de serviço late_start, <code>boot-completed.sh</code> é executado na inicialização concluída, <code>post-mount.sh</code> é executado em overlayfs montado.</li></ul></li></ul><p>Todos os scripts de inicialização serão executados no shell BusyBox <code>ash</code> do KernelSU com o &quot;Modo Autônomo&quot; ativado.</p>`,58),l=[t];function i(r,d,c,p,m,u){return o(),s("div",null,l)}const C=e(n,[["render",i]]);export{v as __pageData,C as default};
