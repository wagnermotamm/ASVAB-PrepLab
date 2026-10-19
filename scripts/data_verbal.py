"""Original word-knowledge and paragraph-comprehension items."""

from __future__ import annotations

import random

from bank_common import make_item, take_unique

# word, answer, distractors, glosses (en, pt, es), optional contrast (en, pt, es)
WORDS: list[tuple] = [
    ("abundant", "plentiful", ["scarce", "limited", "empty"], ("present in great quantity", "presente em grande quantidade", "presente en gran cantidad"), None),
    ("scarce", "rare", ["plentiful", "ordinary", "cheap"], ("available in very small quantity", "disponível em quantidade muito pequena", "disponible en cantidad muy pequeña"), None),
    ("reluctant", "unwilling", ["eager", "cheerful", "certain"], ("not wanting to do something", "sem vontade de fazer algo", "sin ganas de hacer algo"), None),
    ("meticulous", "careful", ["careless", "rapid", "noisy"], ("showing great attention to detail", "com grande atenção aos detalhes", "con gran atención a los detalles"), None),
    ("benevolent", "kind", ["cruel", "selfish", "hurried"], ("wanting to do good for others", "com vontade de fazer o bem aos outros", "con deseo de hacer el bien a los demás"), None),
    ("ambiguous", "unclear", ["obvious", "final", "narrow"], ("open to more than one meaning", "aberto a mais de um sentido", "abierto a más de un significado"), None),
    ("concise", "brief", ["lengthy", "angry", "hidden"], ("using few words", "que usa poucas palavras", "que usa pocas palabras"), None),
    ("diligent", "hardworking", ["lazy", "timid", "wealthy"], ("showing steady effort", "que mostra esforço constante", "que muestra esfuerzo constante"), None),
    ("fragile", "delicate", ["sturdy", "heavy", "loud"], ("easily broken", "que se quebra com facilidade", "que se rompe con facilidad"), None),
    ("hostile", "unfriendly", ["welcoming", "calm", "tiny"], ("showing strong dislike", "que mostra forte antipatia", "que muestra fuerte antipatía"), None),
    ("immense", "enormous", ["tiny", "weak", "brief"], ("extremely large", "extremamente grande", "extremadamente grande"), None),
    ("impartial", "fair", ["biased", "angry", "late"], ("not favoring either side", "sem favorecer nenhum lado", "sin favorecer a ningún lado"), None),
    ("inevitable", "unavoidable", ["optional", "sudden", "rare"], ("certain to happen", "certo de acontecer", "seguro que ocurrirá"), None),
    ("lucid", "clear", ["confusing", "dark", "weak"], ("easy to understand", "fácil de entender", "fácil de entender"), None),
    ("novice", "beginner", ["expert", "leader", "tool"], ("a person who is new to an activity", "pessoa nova numa atividade", "persona nueva en una actividad"), None),
    ("obsolete", "outdated", ["current", "useful", "loud"], ("no longer in use", "que já não se usa", "que ya no se usa"), None),
    ("prudent", "cautious", ["reckless", "wealthy", "noisy"], ("showing careful judgment", "que mostra julgamento cuidadoso", "que muestra juicio cuidadoso"), None),
    ("robust", "strong", ["frail", "quiet", "rare"], ("sturdy and healthy", "firme e resistente", "firme y resistente"), None),
    ("skeptical", "doubtful", ["trusting", "certain", "angry"], ("not easily convinced", "que não se convence com facilidade", "que no se convence con facilidad"), None),
    ("tentative", "provisional", ["final", "loud", "huge"], ("not yet definite", "ainda não definitivo", "aún no definitivo"), None),
    ("thrive", "flourish", ["decline", "rest", "shrink"], ("to grow well", "crescer bem", "crecer bien"), None),
    ("vacant", "empty", ["occupied", "noisy", "narrow"], ("not occupied", "desocupado", "desocupado"), None),
    ("weary", "tired", ["energetic", "angry", "new"], ("very tired", "muito cansado", "muy cansado"), None),
    ("yield", "produce", ["refuse", "destroy", "hide"], ("to give or supply", "fornecer ou produzir", "dar o producir"), None),
    ("zeal", "enthusiasm", ["apathy", "fear", "delay"], ("eager energy for a cause", "energia empenhada numa causa", "energía dedicada a una causa"), None),
    ("abrupt", "sudden", ["gradual", "polite", "weak"], ("happening without warning", "que acontece sem aviso", "que ocurre sin aviso"), None),
    ("adverse", "unfavorable", ["helpful", "pleasant", "minor"], ("working against success", "contrário ao sucesso", "contrario al éxito"), None),
    ("affluent", "wealthy", ["poor", "angry", "late"], ("having plenty of money", "que tem muito dinheiro", "que tiene mucho dinero"), None),
    ("alleviate", "relieve", ["worsen", "ignore", "create"], ("to make a problem less severe", "tornar um problema menos grave", "hacer un problema menos grave"), None),
    ("allot", "assign", ["steal", "mix", "hide"], ("to give out a share", "distribuir uma parte", "repartir una parte"), None),
    ("ample", "sufficient", ["insufficient", "tiny", "hostile"], ("enough for the need", "suficiente para a necessidade", "suficiente para la necesidad"), None),
    ("antagonize", "provoke", ["soothe", "assist", "copy"], ("to make someone hostile", "tornar alguém hostil", "volver hostil a alguien"), None),
    ("apprehensive", "anxious", ["confident", "sleepy", "generous"], ("worried that something bad may happen", "preocupado com algo ruim", "preocupado porque algo malo puede ocurrir"), None),
    ("arbitrary", "random", ["planned", "fair", "slow"], ("based on personal choice rather than a rule", "baseado em escolha pessoal, sem regra", "basado en una elección personal, sin regla"), None),
    ("arid", "dry", ["wet", "cold", "crowded"], ("lacking moisture", "sem umidade", "sin humedad"), None),
    ("articulate", "expressive", ["silent", "clumsy", "shy"], ("able to speak clearly", "capaz de falar com clareza", "capaz de hablar con claridad"), None),
    ("augment", "increase", ["reduce", "divide", "hide"], ("to make larger", "tornar maior", "hacer mayor"), None),
    ("authentic", "genuine", ["fake", "new", "loud"], ("real, not a copy", "verdadeiro, não uma cópia", "verdadero, no una copia"), None),
    ("baffled", "puzzled", ["certain", "eager", "calm"], ("unable to understand", "sem conseguir entender", "sin lograr entender"), None),
    ("barren", "infertile", ["fertile", "crowded", "wet"], ("unable to produce growth", "incapaz de produzir crescimento", "incapaz de producir crecimiento"), None),
    ("benign", "harmless", ["harmful", "loud", "rare"], ("not dangerous", "não perigoso", "no peligroso"), None),
    ("bleak", "grim", ["hopeful", "bright", "noisy"], ("offering little hope", "com pouca esperança", "con poca esperanza"), None),
    ("candid", "frank", ["evasive", "shy", "late"], ("open and honest", "aberto e honesto", "abierto y honesto"), None),
    ("cease", "stop", ["begin", "grow", "help"], ("to come to an end", "chegar ao fim", "llegar al fin"), None),
    ("chronic", "persistent", ["temporary", "sudden", "mild"], ("lasting a long time", "que dura muito tempo", "que dura mucho tiempo"), None),
    ("coerce", "force", ["invite", "allow", "ask"], ("to pressure someone into acting", "pressionar alguém a agir", "presionar a alguien para que actúe"), None),
    ("coherent", "logical", ["confused", "loud", "brief"], ("fitting together in a clear way", "que se encaixa de modo claro", "que encaja de modo claro"), None),
    ("collaborate", "cooperate", ["compete", "refuse", "delay"], ("to work together", "trabalhar junto", "trabajar juntos"), None),
    ("competent", "capable", ["inept", "rude", "late"], ("able to do a job properly", "capaz de fazer o trabalho direito", "capaz de hacer el trabajo bien"), None),
    ("compile", "collect", ["scatter", "erase", "hide"], ("to gather material into one set", "reunir material num conjunto", "reunir material en un conjunto"), None),
    ("comply", "obey", ["resist", "argue", "delay"], ("to act according to a rule or request", "agir conforme uma regra ou pedido", "actuar según una regla o un pedido"), None),
    ("comprehensive", "complete", ["partial", "short", "weak"], ("covering all important parts", "que cobre todas as partes importantes", "que cubre todas las partes importantes"), None),
    ("compulsory", "required", ["optional", "rare", "easy"], ("demanded by a rule", "exigido por uma regra", "exigido por una regla"), None),
    ("conceal", "hide", ["reveal", "display", "break"], ("to keep from being seen", "impedir que seja visto", "impedir que sea visto"), None),
    ("concur", "agree", ["dispute", "delay", "hide"], ("to have the same opinion", "ter a mesma opinião", "tener la misma opinión"), None),
    ("condemn", "denounce", ["praise", "ignore", "copy"], ("to express strong disapproval", "expressar forte reprovação", "expresar una fuerte desaprobación"), None),
    ("confirm", "verify", ["deny", "guess", "hide"], ("to show that something is true", "mostrar que algo é verdadeiro", "mostrar que algo es verdadero"), None),
    ("consecutive", "successive", ["random", "annual", "reverse"], ("following one after another", "um depois do outro, sem interrupção", "uno después del otro, sin interrupción"), None),
    ("consensus", "agreement", ["dispute", "delay", "noise"], ("a shared decision", "uma decisão compartilhada", "una decisión compartida"), None),
    ("conserve", "save", ["waste", "spend", "break"], ("to keep from being used up", "evitar que se esgote", "evitar que se agote"), None),
    ("considerable", "significant", ["slight", "tiny", "rare"], ("large enough to matter", "grande o bastante para importar", "lo bastante grande como para importar"), None),
    ("consistent", "steady", ["erratic", "rare", "loud"], ("not changing without reason", "sem mudar sem motivo", "sin cambiar sin motivo"), None),
    ("conspicuous", "obvious", ["hidden", "tiny", "late"], ("easy to notice", "fácil de notar", "fácil de notar"), None),
    ("contaminate", "pollute", ["purify", "sort", "measure"], ("to make impure", "tornar impuro", "volver impuro"), None),
    ("contemporary", "modern", ["ancient", "rural", "tiny"], ("belonging to the present time", "pertencente ao tempo presente", "perteneciente al tiempo presente"), None),
    ("contradict", "deny", ["support", "repeat", "copy"], ("to say the opposite", "dizer o contrário", "decir lo contrario"), None),
    ("convene", "assemble", ["dismiss", "scatter", "delay"], ("to come together for a meeting", "reunir-se para um encontro", "reunirse para un encuentro"), None),
    ("conventional", "traditional", ["unusual", "new", "loud"], ("following the usual custom", "conforme o costume usual", "conforme la costumbre usual"), None),
    ("convey", "communicate", ["hide", "keep", "break"], ("to make an idea known", "fazer uma ideia ser conhecida", "hacer que una idea se conozca"), None),
    ("copious", "abundant", ["scarce", "dry", "brief"], ("existing in large supply", "existente em grande quantidade", "existente en gran cantidad"), None),
    ("cordial", "friendly", ["hostile", "late", "weak"], ("warm and sincere", "caloroso e sincero", "cálido y sincero"), None),
    ("corroborate", "confirm", ["contradict", "hide", "delay"], ("to support a statement with more evidence", "apoiar uma afirmação com mais evidência", "apoyar una afirmación con más evidencia"), None),
    ("counterfeit", "fake", ["genuine", "legal", "new"], ("made to look real in order to deceive", "feito para parecer real e enganar", "hecho para parecer real y engañar"), None),
    ("credible", "believable", ["doubtful", "tiny", "late"], ("worthy of belief", "digno de crédito", "digno de crédito"), None),
    ("crucial", "essential", ["minor", "optional", "rare"], ("extremely important", "extremamente importante", "extremadamente importante"), None),
    ("cumbersome", "awkward", ["handy", "light", "quick"], ("hard to handle because of size or complexity", "difícil de manusear pelo tamanho ou pela complexidade", "difícil de manejar por el tamaño o la complejidad"), None),
    ("curtail", "reduce", ["extend", "grow", "help"], ("to cut short", "encurtar ou reduzir", "acortar o reducir"), None),
    ("decisive", "conclusive", ["uncertain", "slow", "weak"], ("settling a question", "que resolve uma questão", "que resuelve una cuestión"), None),
    ("deficient", "lacking", ["adequate", "extra", "full"], ("not having enough", "sem ter o suficiente", "sin tener lo suficiente"), None),
    ("defy", "resist", ["obey", "follow", "praise"], ("to refuse to submit", "recusar-se a ceder", "negarse a ceder"), None),
    ("deliberate", "intentional", ["accidental", "quick", "rare"], ("done on purpose", "feito de propósito", "hecho a propósito"), None),
    ("depict", "portray", ["hide", "erase", "break"], ("to show in words or pictures", "mostrar em palavras ou imagens", "mostrar con palabras o imágenes"), None),
    ("deplete", "exhaust", ["replenish", "fill", "grow"], ("to use up a supply", "esgotar uma reserva", "agotar una reserva"), None),
    ("derive", "obtain", ["lose", "refuse", "hide"], ("to get something from a source", "obter algo de uma fonte", "obtener algo de una fuente"), None),
    ("deter", "discourage", ["encourage", "force", "hide"], ("to prevent an action by creating doubt", "impedir uma ação ao criar dúvida", "impedir una acción al crear duda"), None),
    ("detrimental", "harmful", ["beneficial", "mild", "rare"], ("causing damage", "que causa dano", "que causa daño"), None),
    ("devise", "invent", ["copy", "break", "hide"], ("to plan or create", "planejar ou criar", "planear o crear"), None),
    ("diffuse", "spread", ["concentrate", "gather", "stop"], ("to scatter over a wide area", "espalhar por uma área ampla", "esparcir por un área amplia"), None),
    ("dilemma", "predicament", ["solution", "gift", "path"], ("a choice between difficult options", "uma escolha entre opções difíceis", "una elección entre opciones difíciles"), None),
    ("diminish", "lessen", ["increase", "grow", "help"], ("to become smaller", "tornar-se menor", "volverse menor"), None),
    ("disperse", "scatter", ["gather", "collect", "join"], ("to send in different directions", "enviar em direções diferentes", "enviar en direcciones distintas"), None),
    ("dissent", "disagreement", ["consent", "praise", "delay"], ("a difference of opinion", "uma diferença de opinião", "una diferencia de opinión"), None),
    ("distinct", "clear", ["vague", "joint", "rare"], ("unmistakably separate or noticeable", "claramente separado ou perceptível", "claramente separado o perceptible"), None),
    ("diverse", "varied", ["uniform", "identical", "single"], ("made up of different kinds", "formado por tipos diferentes", "formado por tipos diferentes"), None),
    ("dominant", "controlling", ["minor", "weak", "rare"], ("having the greatest influence", "com a maior influência", "con la mayor influencia"), None),
    ("dormant", "inactive", ["active", "awake", "growing"], ("not currently active, though still present", "inativo no momento, embora ainda presente", "inactivo por ahora, aunque todavía presente"), None),
    ("dubious", "doubtful", ["certain", "clear", "safe"], ("causing doubt", "que causa dúvida", "que causa duda"), None),
    ("durable", "sturdy", ["fragile", "brief", "soft"], ("able to last", "capaz de durar", "capaz de durar"), None),
    ("dwindle", "shrink", ["grow", "rise", "spread"], ("to become gradually smaller", "tornar-se gradualmente menor", "volverse gradualmente menor"), None),
    ("eccentric", "unconventional", ["ordinary", "plain", "normal"], ("noticeably different from the usual", "nitidamente diferente do usual", "claramente diferente de lo usual"), None),
    ("elaborate", "detailed", ["simple", "brief", "plain"], ("worked out with many parts", "desenvolvido com muitas partes", "desarrollado con muchas partes"), None),
    ("elated", "joyful", ["miserable", "angry", "tired"], ("very happy", "muito feliz", "muy feliz"), None),
    ("eloquent", "persuasive", ["inarticulate", "quiet", "rude"], ("speaking in a fluent and convincing way", "falando de modo fluente e convincente", "hablando de modo fluido y convincente"), None),
    ("elusive", "evasive", ["obvious", "common", "fixed"], ("hard to catch or define", "difícil de capturar ou definir", "difícil de capturar o definir"), None),
    ("eminent", "distinguished", ["unknown", "minor", "late"], ("standing above others in achievement", "destacado pela realização", "destacado por sus logros"), ("Do not confuse this with a similar word that means 'about to happen'.", "Não confunda com uma palavra parecida que significa 'prestes a acontecer'.", "No la confunda con una palabra parecida que significa 'a punto de ocurrir'.")),
    ("imminent", "impending", ["distant", "finished", "optional"], ("about to happen", "prestes a acontecer", "a punto de ocurrir"), ("Do not confuse this with a similar word that means 'famous'.", "Não confunda com uma palavra parecida que significa 'famoso'.", "No la confunda con una palabra parecida que significa 'famoso'.")),
    ("emphasize", "stress", ["downplay", "hide", "erase"], ("to give special importance", "dar importância especial", "dar importancia especial"), None),
    ("enable", "allow", ["prevent", "block", "stop"], ("to make something possible", "tornar algo possível", "hacer algo posible"), None),
    ("endure", "withstand", ["quit", "break", "fade"], ("to last through difficulty", "suportar uma dificuldade", "soportar una dificultad"), None),
    ("enhance", "improve", ["worsen", "reduce", "hide"], ("to raise the quality of something", "elevar a qualidade de algo", "elevar la calidad de algo"), None),
    ("equivalent", "equal", ["unlike", "greater", "lesser"], ("having the same value", "com o mesmo valor", "con el mismo valor"), None),
    ("erratic", "irregular", ["steady", "planned", "calm"], ("not following a regular pattern", "sem seguir um padrão regular", "sin seguir un patrón regular"), None),
    ("erroneous", "incorrect", ["accurate", "exact", "true"], ("containing an error", "que contém um erro", "que contiene un error"), None),
    ("evident", "obvious", ["hidden", "rare", "doubtful"], ("easy to see or prove", "fácil de ver ou provar", "fácil de ver o probar"), None),
    ("exacerbate", "worsen", ["relieve", "soothe", "help"], ("to make a bad situation worse", "piorar uma situação ruim", "empeorar una situación mala"), None),
    ("exclusive", "restricted", ["open", "shared", "common"], ("limited to a particular group", "limitado a um grupo específico", "limitado a un grupo específico"), None),
    ("exemplify", "illustrate", ["contradict", "hide", "erase"], ("to serve as a typical example", "servir como exemplo típico", "servir como ejemplo típico"), None),
    ("exempt", "excused", ["required", "included", "forced"], ("freed from a duty", "livre de um dever", "libre de un deber"), None),
    ("exhaustive", "thorough", ["partial", "brief", "quick"], ("covering every part", "que cobre cada parte", "que cubre cada parte"), None),
    ("explicit", "specific", ["implied", "hidden", "vague"], ("stated fully and clearly", "dito de modo completo e claro", "dicho de modo completo y claro"), None),
    ("facilitate", "ease", ["hinder", "block", "delay"], ("to make a process easier", "facilitar um processo", "facilitar un proceso"), None),
    ("feasible", "possible", ["impossible", "costly", "rare"], ("able to be done", "que pode ser feito", "que se puede hacer"), None),
    ("feeble", "weak", ["strong", "loud", "huge"], ("lacking strength", "sem força", "sin fuerza"), None),
    ("fervent", "passionate", ["indifferent", "calm", "cold"], ("showing intense feeling", "com sentimento intenso", "con un sentimiento intenso"), None),
    ("fluctuate", "vary", ["stabilize", "stop", "fix"], ("to rise and fall irregularly", "subir e descer sem regularidade", "subir y bajar sin regularidad"), None),
    ("foster", "encourage", ["discourage", "block", "hide"], ("to promote the development of something", "promover o desenvolvimento de algo", "promover el desarrollo de algo"), None),
    ("fraudulent", "dishonest", ["honest", "legal", "open"], ("intended to deceive", "feito para enganar", "hecho para engañar"), None),
    ("fundamental", "basic", ["advanced", "minor", "optional"], ("forming a necessary foundation", "que forma uma base necessária", "que forma una base necesaria"), None),
    ("generous", "giving", ["stingy", "harsh", "late"], ("willing to share", "disposto a compartilhar", "dispuesto a compartir"), None),
    ("genuine", "real", ["fake", "new", "rare"], ("actually what it appears to be", "de fato o que parece ser", "realmente lo que parece ser"), None),
    ("grave", "serious", ["playful", "minor", "loud"], ("requiring careful thought because of importance or danger", "que exige cuidado pela importância ou pelo perigo", "que exige cuidado por la importancia o el peligro"), None),
    ("hinder", "obstruct", ["help", "speed", "allow"], ("to make progress more difficult", "tornar o progresso mais difícil", "hacer el progreso más difícil"), None),
    ("hypothetical", "supposed", ["proven", "final", "ancient"], ("based on a possibility rather than a fact", "baseado numa possibilidade, não num fato", "basado en una posibilidad, no en un hecho"), None),
    ("illuminate", "clarify", ["darken", "hide", "confuse"], ("to make something easier to understand, or to light it", "tornar algo mais claro ou iluminá-lo", "volver algo más claro o iluminarlo"), None),
    ("imply", "suggest", ["state", "deny", "erase"], ("to express indirectly", "expressar de modo indireto", "expresar de modo indirecto"), None),
    ("indifferent", "unconcerned", ["eager", "hostile", "careful"], ("having no particular interest", "sem interesse especial", "sin un interés especial"), None),
    ("industrious", "hardworking", ["idle", "careless", "wealthy"], ("working with energy and care", "trabalhando com energia e cuidado", "trabajando con energía y cuidado"), None),
    ("inferior", "lesser", ["superior", "equal", "central"], ("lower in quality or rank", "inferior em qualidade ou posição", "inferior en calidad o rango"), None),
    ("inhibit", "restrain", ["encourage", "release", "speed"], ("to hold back an action", "conter uma ação", "contener una acción"), None),
    ("innovate", "invent", ["copy", "repeat", "erase"], ("to introduce a new method", "introduzir um método novo", "introducir un método nuevo"), None),
    ("inquiry", "investigation", ["answer", "silence", "gift"], ("a search for information", "uma busca por informação", "una búsqueda de información"), None),
    ("integrity", "honesty", ["deceit", "wealth", "speed"], ("the quality of being honest and whole", "a qualidade de ser honesto e íntegro", "la cualidad de ser honesto e íntegro"), None),
    ("interrupt", "stop", ["continue", "finish", "allow"], ("to break the continuity of something", "interromper a continuidade de algo", "interrumpir la continuidad de algo"), None),
    ("isolate", "separate", ["combine", "join", "mix"], ("to set apart from others", "colocar à parte dos outros", "poner aparte de los demás"), None),
    ("justify", "defend", ["condemn", "hide", "erase"], ("to show that something is right or reasonable", "mostrar que algo é certo ou razoável", "mostrar que algo es correcto o razonable"), None),
    ("keen", "sharp", ["dull", "weak", "late"], ("highly sensitive or eager", "muito sensível ou interessado", "muy sensible o interesado"), None),
    ("linger", "remain", ["depart", "rush", "finish"], ("to stay longer than expected", "ficar mais tempo do que o esperado", "quedarse más tiempo del esperado"), None),
    ("magnitude", "size", ["color", "speed", "date"], ("greatness in size or importance", "grandeza em tamanho ou importância", "grandeza en tamaño o importancia"), None),
    ("mandatory", "required", ["optional", "rare", "brief"], ("ordered by a rule", "ordenado por uma regra", "ordenado por una regla"), None),
    ("meager", "scanty", ["plentiful", "rich", "heavy"], ("lacking in amount", "insuficiente em quantidade", "insuficiente en cantidad"), None),
    ("negligent", "careless", ["careful", "prompt", "kind"], ("failing to take proper care", "sem o cuidado devido", "sin el cuidado debido"), None),
    ("notable", "remarkable", ["ordinary", "hidden", "tiny"], ("worthy of attention", "digno de atenção", "digno de atención"), None),
    ("objective", "impartial", ["biased", "angry", "personal"], ("based on facts rather than feelings", "baseado em fatos, não em sentimentos", "basado en hechos, no en sentimientos"), ("Here the word is an adjective. A related noun can mean a goal.", "Aqui a palavra é um adjetivo. Um substantivo parecido pode significar um objetivo.", "Aquí la palabra es un adjetivo. Un sustantivo parecido puede significar un objetivo.")),
    ("obscure", "unclear", ["famous", "obvious", "bright"], ("not clearly understood, or not well known", "não claramente entendido, ou pouco conhecido", "no claramente entendido, o poco conocido"), None),
    ("omit", "exclude", ["include", "repeat", "stress"], ("to leave out", "deixar de fora", "dejar fuera"), None),
    ("optimistic", "hopeful", ["gloomy", "angry", "certain"], ("expecting a good result", "esperando um bom resultado", "esperando un buen resultado"), None),
    ("methodical", "orderly", ["chaotic", "late", "weak"], ("arranged in a regular, careful way", "organizado de modo regular e cuidadoso", "organizado de modo regular y cuidadoso"), None),
    ("penalize", "punish", ["reward", "ignore", "copy"], ("to impose a penalty", "impor uma penalidade", "imponer una penalidad"), None),
    ("permanent", "lasting", ["temporary", "brief", "sudden"], ("intended to remain", "feito para permanecer", "hecho para permanecer"), None),
    ("plausible", "believable", ["absurd", "proven", "hidden"], ("seeming reasonable, even if not proven", "que parece razoável, mesmo sem prova", "que parece razonable, aunque no esté probado"), None),
    ("precede", "lead", ["follow", "delay", "copy"], ("to come before", "vir antes", "venir antes"), ("Do not confuse this with a similar word that means 'to go forward'.", "Não confunda com uma palavra parecida que significa 'seguir adiante'.", "No la confunda con una palabra parecida que significa 'seguir adelante'.")),
    ("proceed", "continue", ["stop", "precede", "retreat"], ("to go forward", "seguir adiante", "seguir adelante"), ("Do not confuse this with a similar word that means 'to come before'.", "Não confunda com uma palavra parecida que significa 'vir antes'.", "No la confunda con una palabra parecida que significa 'venir antes'.")),
    ("prohibit", "forbid", ["allow", "suggest", "delay"], ("to refuse to permit", "não permitir", "no permitir"), None),
    ("prolong", "extend", ["shorten", "end", "hide"], ("to make longer in time", "tornar mais longo no tempo", "hacer más largo en el tiempo"), None),
    ("prosper", "succeed", ["fail", "rest", "decline"], ("to do well, especially financially", "ir bem, especialmente no financeiro", "irle bien, especialmente en lo económico"), None),
    ("prudent", "wary", ["reckless", "loud", "idle"], ("careful to avoid unnecessary risk", "cuidadoso para evitar risco desnecessário", "cuidadoso para evitar un riesgo innecesario"), None),
    ("rational", "reasonable", ["absurd", "emotional", "random"], ("based on reason", "baseado na razão", "basado en la razón"), None),
    ("reconcile", "settle", ["widen", "ignore", "copy"], ("to restore agreement", "restaurar o acordo", "restaurar el acuerdo"), None),
    ("redundant", "unnecessary", ["essential", "rare", "brief"], ("not needed because something else already covers it", "desnecessário porque outra coisa já cobre a função", "innecesario porque otra cosa ya cubre la función"), None),
    ("relevant", "applicable", ["unrelated", "ancient", "secret"], ("connected to the matter at hand", "ligado ao assunto em questão", "conectado con el asunto en cuestión"), None),
    ("reluctant", "hesitant", ["eager", "certain", "loud"], ("slow to agree", "lento para concordar", "lento para aceptar"), None),
    ("resemble", "match", ["differ", "hide", "break"], ("to look or be like something else", "parecer-se com outra coisa", "parecerse a otra cosa"), None),
    ("resolve", "settle", ["delay", "confuse", "hide"], ("to find a solution or to decide firmly", "encontrar uma solução ou decidir com firmeza", "encontrar una solución o decidir con firmeza"), None),
    ("restrain", "hold", ["release", "encourage", "speed"], ("to keep under control", "manter sob controle", "mantener bajo control"), None),
    ("revise", "amend", ["keep", "erase", "copy"], ("to change in order to improve", "alterar para melhorar", "cambiar para mejorar"), None),
    ("scrutinize", "examine", ["ignore", "skim", "hide"], ("to inspect very closely", "inspecionar de muito perto", "inspeccionar muy de cerca"), None),
    ("significant", "meaningful", ["trivial", "hidden", "late"], ("important enough to notice", "importante o bastante para notar", "lo bastante importante como para notarlo"), None),
    ("simulate", "imitate", ["invent", "destroy", "measure"], ("to imitate the appearance or behavior of something", "imitar a aparência ou o comportamento de algo", "imitar la apariencia o el comportamiento de algo"), None),
    ("skeptical", "unconvinced", ["trusting", "eager", "certain"], ("inclined to question a claim", "inclinado a questionar uma afirmação", "inclinado a cuestionar una afirmación"), None),
    ("solitary", "alone", ["crowded", "social", "noisy"], ("without companions", "sem companhia", "sin compañía"), None),
    ("spontaneous", "unplanned", ["rehearsed", "forced", "late"], ("arising without being planned", "que surge sem planejamento", "que surge sin planificación"), None),
    ("stable", "steady", ["unstable", "brief", "loud"], ("not likely to change or fall", "pouco provável de mudar ou cair", "poco probable que cambie o caiga"), None),
    ("subsequent", "later", ["earlier", "first", "unrelated"], ("coming after something else", "que vem depois de outra coisa", "que viene después de otra cosa"), None),
    ("sufficient", "enough", ["lacking", "excess", "tiny"], ("as much as is needed", "tanto quanto é necessário", "tanto como se necesita"), None),
    ("superficial", "shallow", ["deep", "thorough", "hidden"], ("concerned only with the surface", "ligado apenas à superfície", "limitado a la superficie"), None),
    ("surplus", "excess", ["shortage", "debt", "need"], ("an amount left over", "uma quantidade que sobra", "una cantidad que sobra"), None),
    ("sustain", "maintain", ["abandon", "end", "hide"], ("to keep something going", "manter algo em curso", "mantener algo en marcha"), None),
    ("tedious", "boring", ["exciting", "brief", "loud"], ("too long and dull", "longo demais e sem graça", "demasiado largo y aburrido"), None),
    ("terminate", "end", ["begin", "extend", "pause"], ("to bring to an end", "levar ao fim", "llevar al fin"), None),
    ("tolerate", "allow", ["forbid", "punish", "hide"], ("to permit something one may not like", "permitir algo de que talvez não se goste", "permitir algo que quizá no agrade"), None),
    ("transparent", "clear", ["opaque", "hidden", "dark"], ("easy to see through, or easy to understand", "fácil de ver através, ou fácil de entender", "fácil de ver a través, o fácil de entender"), None),
    ("trivial", "unimportant", ["crucial", "rare", "complex"], ("too small to matter", "pequeno demais para importar", "demasiado pequeño para importar"), None),
    ("uniform", "consistent", ["varied", "random", "broken"], ("the same throughout", "igual em toda a extensão", "igual en toda su extensión"), None),
    ("unique", "singular", ["common", "double", "ordinary"], ("unlike anything else", "diferente de todo o resto", "diferente de todo lo demás"), None),
    ("urgent", "pressing", ["optional", "distant", "calm"], ("needing immediate attention", "que precisa de atenção imediata", "que necesita atención inmediata"), None),
    ("valid", "sound", ["false", "expired", "hidden"], ("well grounded and acceptable", "bem fundamentado e aceitável", "bien fundado y aceptable"), None),
    ("versatile", "adaptable", ["rigid", "narrow", "fragile"], ("able to be used in many ways", "capaz de ser usado de vários modos", "capaz de usarse de varios modos"), None),
    ("viable", "workable", ["impossible", "broken", "rare"], ("capable of succeeding", "capaz de dar certo", "capaz de funcionar"), None),
    ("vigorous", "energetic", ["feeble", "slow", "quiet"], ("strong and active", "forte e ativo", "fuerte y activo"), None),
    ("vulnerable", "exposed", ["protected", "strong", "hidden"], ("open to harm", "aberto a dano", "expuesto al daño"), None),
    ("weary", "fatigued", ["rested", "eager", "new"], ("worn out by effort", "esgotado pelo esforço", "agotado por el esfuerzo"), None),
    ("withdraw", "remove", ["deposit", "advance", "join"], ("to take back or to pull away", "retirar ou afastar-se", "retirar o alejarse"), None),
    ("withhold", "retain", ["release", "give", "announce"], ("to refuse to give something", "recusar-se a entregar algo", "negarse a entregar algo"), None),
]


def _tri(en: str, pt: str, es: str) -> dict[str, str]:
    return {"en": en, "pt-BR": pt, "es": es}


def word_items(limit: int, seen: set[str]) -> list[dict]:
    rng = random.Random(1701)
    rows = []
    used = set()
    index = 1
    for word, answer, distractors, gloss, contrast in WORDS:
        if word in used:
            continue
        if answer.lower() in {item.lower() for item in distractors}:
            continue
        used.add(word)
        en, pt, es = gloss
        vocab_text = {
            "en": f"{word.capitalize()}: {en}." + (f" {contrast[0]}" if contrast else ""),
            "pt-BR": f"{word.capitalize()}: {pt}." + (f" {contrast[1]}" if contrast else ""),
            "es": f"{word.capitalize()}: {es}." + (f" {contrast[2]}" if contrast else ""),
        }
        # Keep the synonym out of quick and method hints.
        strategy = {
            "quick": _tri(
                "Look for the choice with nearly the same meaning. Opposites can be eliminated first.",
                "Procure a alternativa com quase o mesmo sentido. Os opostos podem ser eliminados primeiro.",
                "Busque la opción con casi el mismo sentido. Los opuestos pueden eliminarse primero.",
            ),
            "method": _tri(
                f"The target word describes something that is {en}.",
                f"A palavra-alvo descreve algo que é ou faz isto: {pt}.",
                f"La palabra objetivo describe algo que es o hace esto: {es}.",
            ),
            "step": _tri(
                f"Match that meaning to the choice '{answer}'.",
                f"Associe esse sentido à alternativa '{answer}'.",
                f"Relacione ese sentido con la opción '{answer}'.",
            ),
        }
        row = make_item(
            external_key=f"wk-{index:04d}",
            subject="WK",
            stem=f'The word "{word}" most nearly means',
            correct=answer,
            wrongs=distractors,
            difficulty="EASY" if index % 5 == 0 else "MEDIUM" if index % 3 else "HARD",
            topic="synonym",
            strategy=strategy,
            explain=_tri(
                f'In this item, "{word}" means {en}. The closest choice is "{answer}".',
                f'Nesta questão, "{word}" significa {pt}. A alternativa mais próxima é "{answer}".',
                f'En esta pregunta, "{word}" significa {es}. La opción más cercana es "{answer}".',
            ),
            concept=_tri("Synonyms in context", "Sinônimos no contexto", "Sinónimos en contexto"),
            why_wrong=_tri(
                "This choice does not match the meaning of the target word.",
                "Esta alternativa não corresponde ao sentido da palavra-alvo.",
                "Esta opción no corresponde al sentido de la palabra objetivo.",
            ),
            rng=rng,
            vocab=[{"term": word, "text": vocab_text}],
        )
        # The stem must mark the word for the popover.
        row["stem"] = f'The word "[[{word}]]" most nearly means'
        rows.append(row)
        index += 1
    return take_unique(rows, limit, seen)


PASSAGES: list[dict] = []


def _add_passage(title: str, text: str, questions: list[dict]) -> None:
    PASSAGES.append({"title": title, "text": text, "questions": questions})


_add_passage(
    "Clinic supplies",
    "Maya works the night [[shift]] at a community clinic. Before dawn she checks the supply room. Last Tuesday the bandage cabinet was nearly empty, so she called the warehouse before midnight. The [[shipment]] arrived at 4 a.m., and the doors opened to walk-in patients at 6 a.m. Maya left a note telling the morning supervisor which boxes still needed to be counted.",
    [
        ("Why did Maya call the warehouse?", "The bandage cabinet was nearly empty.", ["The morning supervisor was late.", "Patients were already in the waiting room.", "The shipment had already been counted."], "stated detail"),
        ("When did the shipment arrive?", "Before the clinic opened to walk-in patients.", ["After the morning count was finished.", "At midnight.", "After 6 a.m."], "time order"),
    ],
)
_add_passage(
    "Bridge inspection",
    "The city closed the Oak Street bridge for three days so engineers could inspect the steel supports. They found surface rust but no cracks in the main beams. Workers sanded the rusty spots and applied a protective coating. The bridge reopened on Friday morning, in time for the usual commuter traffic.",
    [
        ("Why was the bridge closed?", "Engineers needed to inspect the supports.", ["A main beam had cracked.", "Commuters asked for a new route.", "Workers were painting the roadway only."], "stated detail"),
        ("What did the engineers find?", "Surface rust, but no cracks in the main beams.", ["Cracks in every support.", "A broken pedestrian walkway.", "No rust at all."], "stated detail"),
    ],
)
_add_passage(
    "Garden plan",
    "Mr. Alvarez divided his garden into four equal beds. He planted beans in the bed that gets morning sun and lettuce in the bed that stays partly shaded. The other two beds were left for tomatoes after the last frost. He wrote the plan on a card and taped it inside the shed so his daughter could water the correct bed each evening.",
    [
        ("Where did Mr. Alvarez plant the lettuce?", "In the bed that stays partly shaded.", ["In the bed that gets morning sun.", "In all four beds.", "Inside the shed."], "stated detail"),
        ("Why did he tape the card inside the shed?", "So his daughter would know which bed to water.", ["So the tomatoes would stay warm.", "To keep rain off the beans.", "To record the date of the last frost."], "purpose"),
    ],
)
_add_passage(
    "Library hours",
    "The public library will open one hour later on Wednesdays during June because the staff is attending a training class. The training ends at 10 a.m., and the doors will open at 11 a.m. on those days. All other weekdays will keep the regular 9 a.m. opening. A sign on the entrance lists the temporary schedule.",
    [
        ("What is different on Wednesdays in June?", "The library opens later than usual.", ["The library is closed all day.", "The training class is open to the public at 9 a.m.", "The regular opening time changes every weekday."], "main idea"),
        ("When does the Wednesday training end?", "At 10 a.m.", ["At 9 a.m.", "At 11 a.m.", "At the end of June."], "stated detail"),
    ],
)
_add_passage(
    "Bicycle repair",
    "Jonas could not ride his bicycle because the rear tire kept losing air. He checked the valve and found it tight. Then he removed the wheel and listened along the tube while it was inflated. A faint hiss came from a tiny puncture near the valve stem. He patched the tube, waited ten minutes, and the tire held air.",
    [
        ("What caused the tire to lose air?", "A tiny puncture in the tube.", ["A loose valve.", "A broken wheel.", "A missing patch."], "stated detail"),
        ("What did Jonas do after he found the hiss?", "He patched the tube.", ["He replaced the whole bicycle.", "He loosened the valve.", "He stopped listening and rode away."], "sequence"),
    ],
)
_add_passage(
    "Weather delay",
    "The ferry to Hamilton Island was scheduled to depart at 7:30 a.m. Thick fog reduced visibility, so the captain postponed departure until the harbor radar showed a clear channel. Passengers waited in the terminal, where the staff served coffee. The ferry left at 9:10 a.m. and still reached the island before noon.",
    [
        ("Why was the departure postponed?", "Fog reduced visibility.", ["The radar was broken.", "Passengers arrived late.", "The island harbor was closed for the day."], "cause"),
        ("The passage indicates that the ferry", "arrived at the island before noon.", ["never left the terminal.", "departed at 7:30 a.m.", "waited until the next morning."], "inference"),
    ],
)
_add_passage(
    "Shop safety",
    "Before using the drill press, apprentices must clamp the workpiece and put on eye protection. Last month an unclamped plate spun out of position, but no one was hurt because the operator had stepped back. The instructor now requires a second student to confirm that the clamp is tight before the machine starts.",
    [
        ("What must apprentices do before using the drill press?", "Clamp the workpiece and wear eye protection.", ["Step back and leave the clamp loose.", "Ask a visitor to start the machine.", "Remove eye protection."], "stated detail"),
        ("Why was no one hurt last month?", "The operator had stepped back when the plate moved.", ["The plate was clamped tightly.", "The machine never started.", "The instructor held the plate."], "cause"),
    ],
)
_add_passage(
    "River sample",
    "A science class collected water from two sites on the same river. Site A was upstream of the town, and Site B was downstream of the wastewater plant. The upstream sample was clear. The downstream sample was cloudy and contained more dissolved solids. The class concluded that something entering the river in town changed the water between the two sites.",
    [
        ("Which sample was cloudy?", "The sample from Site B.", ["The sample from Site A.", "Both samples equally.", "Neither sample."], "stated detail"),
        ("What conclusion did the class draw?", "Something entering the river in town changed the water.", ["The upstream water was unsafe to touch.", "The two sites were identical.", "Rain had cleaned the downstream water."], "inference"),
    ],
)
_add_passage(
    "Recipe change",
    "The bakery reduced the sugar in its oatmeal cookies by one quarter. Customers still bought the cookies, and two regulars said the new batch tasted less sweet but still good. The baker kept the lower-sugar recipe and printed a small note on the label so buyers would know about the change.",
    [
        ("How did the baker change the cookies?", "The baker used less sugar.", ["The baker removed the oatmeal.", "The baker doubled the sugar.", "The baker stopped selling the cookies."], "stated detail"),
        ("Why did the baker print a note on the label?", "To tell buyers about the recipe change.", ["To raise the price.", "To list every customer comment.", "To advertise a new store."], "purpose"),
    ],
)
_add_passage(
    "Night class",
    "Renee enrolled in a welding course that meets on Tuesday and Thursday evenings. She works at a warehouse until 5 p.m., so she rides the bus directly to the school. The first class covered shop safety and the names of the joints she would practice. Renee borrowed a helmet from the program because she did not own one yet.",
    [
        ("When does Renee's welding course meet?", "On Tuesday and Thursday evenings.", ["Every morning before work.", "Only on Fridays.", "On weekend afternoons."], "stated detail"),
        ("Why did Renee borrow a helmet?", "She did not own one yet.", ["The school had no safety rules.", "Her warehouse job required it that night.", "The first class was canceled."], "stated detail"),
    ],
)
_add_passage(
    "Park path",
    "Volunteers widened the gravel path around Miller Pond so two people could walk side by side. They left the older narrow trail in place for runners who prefer a softer surface. Signs now mark both routes. The wide path is recommended for visitors using strollers.",
    [
        ("Who is the wide path especially recommended for?", "Visitors using strollers.", ["Runners who want a soft surface.", "Swimmers in the pond.", "Drivers on the park road."], "stated detail"),
        ("What happened to the older trail?", "It was left in place.", ["It was paved with concrete.", "It was closed permanently.", "It was moved to the parking lot."], "stated detail"),
    ],
)
_add_passage(
    "Battery test",
    "Andre tested two flashlight batteries with a meter. The older battery showed a lower voltage than the new one, even though both were the same size. The flashlight worked with the new battery and was dim with the older one. Andre recycled the weak battery instead of putting it back in the drawer.",
    [
        ("How did the two batteries compare?", "The older battery had a lower voltage.", ["They had the same voltage.", "The new battery was larger.", "The older battery made the light brighter."], "comparison"),
        ("What did Andre do with the weak battery?", "He recycled it.", ["He returned it to the drawer.", "He installed it in a radio.", "He recharged it overnight."], "stated detail"),
    ],
)
_add_passage(
    "Museum tour",
    "The history museum offers a free tour at noon on Saturdays. The guide begins in the map room and ends at the exhibit about local shipbuilding. Visitors may take photographs without flash. Large bags must be left at the front desk. The tour lasts about forty minutes.",
    [
        ("Where does the tour end?", "At the shipbuilding exhibit.", ["In the map room.", "At the front desk.", "Outside the museum."], "stated detail"),
        ("What must visitors do with large bags?", "Leave them at the front desk.", ["Carry them through the map room.", "Use them to hold photographs.", "Check them after the tour."], "stated detail"),
    ],
)
_add_passage(
    "Apartment notice",
    "The building manager posted a notice about the water shutoff. Water will be off from 9 a.m. to 1 p.m. on Monday so a leaking valve in the basement can be replaced. Residents are asked to fill bottles ahead of time. The manager expects normal service by early afternoon.",
    [
        ("Why will the water be off?", "A leaking valve will be replaced.", ["The bottles need to be washed.", "Residents requested a holiday.", "The basement will be painted."], "cause"),
        ("How long is the planned shutoff?", "Four hours.", ["One hour.", "All day Monday.", "Until Tuesday morning."], "computation from the passage"),
    ],
)
_add_passage(
    "Seed order",
    "A community garden ordered tomato, pepper, and herb seeds. The tomato seeds arrived first, but the pepper packet was missing from the box. The supplier sent the pepper seeds two days later at no extra charge. The herbs had been included in the original shipment.",
    [
        ("Which seeds were missing at first?", "The pepper seeds.", ["The tomato seeds.", "The herb seeds.", "All of the seeds."], "stated detail"),
        ("What did the supplier do about the missing packet?", "Sent it later at no extra charge.", ["Canceled the whole order.", "Asked the garden to pay twice.", "Replaced the herbs instead."], "stated detail"),
    ],
)
_add_passage(
    "Bus route",
    "Route 14 used to stop at the old mill. Starting next month, the bus will stop two blocks east, beside the new clinic. Riders who work at the mill can still reach it by a short walk. The transit office printed maps showing both the old stop and the new one.",
    [
        ("Where will the new stop be?", "Beside the new clinic.", ["Inside the old mill.", "Two blocks west of the mill.", "At the transit office."], "stated detail"),
        ("The passage suggests that mill workers", "can walk from the new stop.", ["will lose bus service completely.", "must drive to the clinic.", "drew the new maps themselves."], "inference"),
    ],
)
_add_passage(
    "Lab notebook",
    "Students in the chemistry lab must record observations in ink, not pencil. If they make an error, they draw one line through it and write the correction beside it. Erasing is not allowed because the instructor needs to see the original note. Each page is dated at the top.",
    [
        ("How should students correct an error?", "Draw one line through it and write the correction beside it.", ["Erase it completely.", "Tear out the page.", "Rewrite the page in pencil."], "stated rule"),
        ("Why is erasing not allowed?", "The instructor needs to see the original note.", ["Pencil is easier to date.", "Ink smears the table.", "The pages have no room for corrections."], "cause"),
    ],
)
_add_passage(
    "Harbor lights",
    "The harbor replaced three navigation lights that had grown dim. The new lights use less electricity and can be seen farther on a clear night. During the installation, boaters were told to rely on the remaining lights and on their charts. All three new lights were working by sunset on Thursday.",
    [
        ("What advantage do the new lights have?", "They use less electricity and can be seen farther.", ["They replace the need for charts.", "They work only on Thursday.", "They are dimmer than the old lights."], "comparison"),
        ("What were boaters told to do during installation?", "Rely on the remaining lights and on their charts.", ["Stay out of the harbor all week.", "Install their own lights.", "Ignore the charts."], "stated detail"),
    ],
)
_add_passage(
    "Cooking class",
    "The evening cooking class practiced making soup. The instructor said to simmer the vegetables, not boil them hard, so they would keep their shape. One student turned the heat too high, and the potatoes broke apart. The instructor had the class lower the flame and continue.",
    [
        ("What instruction did the teacher give about the vegetables?", "Simmer them rather than boiling them hard.", ["Boil them until they disappear.", "Freeze them before cooking.", "Leave them out of the soup."], "stated detail"),
        ("What happened when the heat was too high?", "The potatoes broke apart.", ["The soup froze.", "The class ended immediately.", "The vegetables kept a perfect shape."], "cause and effect"),
    ],
)
_add_passage(
    "Tool library",
    "The neighborhood tool library lends rakes, drills, and ladders for one week at a time. Members reserve items online and pick them up on Saturday morning. If a tool is returned dirty, the next member may have to clean it before use. The volunteers ask borrowers to wipe off mud and report any damage.",
    [
        ("How long may a member keep a tool?", "One week.", ["One morning.", "Until it breaks.", "All summer."], "stated detail"),
        ("What are borrowers asked to do?", "Wipe off mud and report damage.", ["Paint every tool.", "Keep the ladder permanently.", "Reserve items only by phone at night."], "stated detail"),
    ],
)
_add_passage(
    "Rain barrel",
    "Leila connected a rain barrel to the downspout on the north side of her house. After one storm the barrel was full, so the overflow ran through a hose into the flower bed. She uses the collected water for plants, not for drinking. A screen on the inlet keeps leaves out of the barrel.",
    [
        ("What is the collected water used for?", "Watering plants.", ["Drinking.", "Washing the roof.", "Filling the street."], "stated detail"),
        ("What does the screen do?", "It keeps leaves out of the barrel.", ["It heats the water.", "It measures rainfall.", "It blocks the overflow hose."], "function"),
    ],
)
_add_passage(
    "Shift trade",
    "Carlos asked to trade his Saturday shift with Dana. Dana agreed because she needed Monday afternoon free for a driving test. Their supervisor approved the written request on Friday. Both employees will still work the same number of hours that week.",
    [
        ("Why did Dana agree to the trade?", "She needed Monday afternoon free.", ["She wanted fewer hours.", "The supervisor refused Carlos.", "The driving test was on Saturday."], "cause"),
        ("What remained the same?", "The number of hours each employee works that week.", ["The day of Dana's driving test.", "Carlos's original Saturday shift.", "The supervisor's schedule."], "stated detail"),
    ],
)
_add_passage(
    "Museum label",
    "A label beside the compass explained that sailors once used it with paper charts to estimate direction. The compass needle points toward magnetic north, which is not exactly the same as the North Pole on the map. The exhibit asks visitors to notice that small difference before they try the practice chart.",
    [
        ("What does the needle point toward?", "Magnetic north.", ["The exact North Pole on every map.", "The practice chart only.", "The paper chart's south edge."], "stated detail"),
        ("What does the exhibit want visitors to notice?", "Magnetic north and the map's North Pole are not exactly the same.", ["Compasses no longer work.", "Charts have replaced needles completely.", "The label is printed upside down."], "main idea"),
    ],
)
_add_passage(
    "Kitchen inventory",
    "Before the lunch rush, the cafeteria manager counted the trays. There were enough trays for the expected students, but only a few clean cups remained. She started the dishwasher immediately. By the time the first class arrived, a rack of cups was ready and the trays were stacked by the serving line.",
    [
        ("What was in short supply before the rush?", "Clean cups.", ["Trays.", "Students.", "Dishwashers."], "stated detail"),
        ("What was true when the first class arrived?", "A rack of cups was ready.", ["The trays had not been counted.", "The dishwasher was still empty.", "The serving line had no trays."], "time order"),
    ],
)
_add_passage(
    "Trail closure",
    "Rangers closed the upper trail after heavy rain loosened rocks above the switchbacks. The lower trail remained open. Hikers who had planned to reach the summit were advised to turn around at the meadow. The closure will be reviewed after the slope dries.",
    [
        ("Which trail remained open?", "The lower trail.", ["The upper trail.", "Every trail to the summit.", "None of the trails."], "stated detail"),
        ("When will the closure be reviewed?", "After the slope dries.", ["Before the rain starts.", "When hikers reach the summit.", "At the meadow each morning."], "stated detail"),
    ],
)
_add_passage(
    "Printer jam",
    "The office printer stopped because a folded label was stuck in the paper path. Nia turned the machine off, opened the rear door, and removed the label. She did not pull the sheet from the front, which could have torn it and left scraps inside. After she closed the door, the printer finished the job.",
    [
        ("What stopped the printer?", "A folded label stuck in the paper path.", ["A missing rear door.", "An empty ink tank mentioned in the passage.", "A finished job."], "cause"),
        ("Why did Nia avoid pulling the sheet from the front?", "Pulling it that way could tear it and leave scraps inside.", ["The front of the printer was locked for the week.", "The label was not really stuck.", "The job had already finished."], "reason"),
    ],
)
_add_passage(
    "Community choir",
    "The community choir rehearses in the school cafeteria because the music room is being repaired. Chairs are set up after the last lunch period and stacked again before the night custodians arrive. The director shortened practice by fifteen minutes so the floor can be mopped. The concert is still planned for the first Friday of May.",
    [
        ("Why does the choir rehearse in the cafeteria?", "The music room is being repaired.", ["The concert was canceled.", "The custodians asked to sing.", "The cafeteria is larger than the concert hall."], "cause"),
        ("Why was practice shortened?", "So the floor can be mopped.", ["So the concert can move to April.", "Because the chairs cannot be stacked.", "Because lunch lasts all evening."], "purpose"),
    ],
)
_add_passage(
    "Fuel log",
    "A delivery driver records the odometer reading every time she buys fuel. On Monday the reading was 42,180 miles, and she bought 10 gallons. On Thursday the reading was 42,480 miles, and she bought fuel again. The difference of 300 miles helped her estimate how far the van travels between fill-ups.",
    [
        ("What does the driver record when she buys fuel?", "The odometer reading.", ["Only the price of lunch.", "The names of customers.", "The Thursday weather."], "stated detail"),
        ("How many miles were driven between the two readings?", "300 miles.", ["10 miles.", "42,180 miles.", "42,480 miles."], "computation from the passage"),
    ],
)
_add_passage(
    "Seedlings",
    "The biology class grew bean seedlings in two trays. One tray sat in a sunny window. The other sat in a closet with the door closed. After a week, the window seedlings were green and upright. The closet seedlings were pale and had fallen over. The class linked the difference to the presence of light.",
    [
        ("How did the closet seedlings look?", "Pale, and they had fallen over.", ["Green and upright.", "Identical to the window seedlings.", "Taller than the plants in the window."], "comparison"),
        ("What did the class link to the difference?", "The presence of light.", ["The size of the beans only.", "A change in the closet door's color.", "Extra water in the closet."], "inference"),
    ],
)
_add_passage(
    "Appointment card",
    "Dr. Shah's office asks patients to arrive ten minutes early to update their forms. Omar's appointment is at 2:15 p.m. He plans to reach the office at 2:05 p.m. The card also says to bring a list of current medicines. Omar wrote the list the night before so he would not forget it.",
    [
        ("What time does Omar plan to arrive?", "2:05 p.m.", ["2:15 p.m.", "Ten minutes after the appointment.", "The night before."], "stated detail"),
        ("Why did Omar write the list the night before?", "So he would not forget it.", ["The doctor asked him to arrive at night.", "The forms were already finished.", "The office closed at 2:05 p.m."], "purpose"),
    ],
)
_add_passage(
    "Workshop fan",
    "A box fan in the workshop is aimed at the doorway, not at the pile of sawdust. The instructor explained that blowing dust into the air makes it harder to breathe and to see. Students sweep the dust into a pan after the tools are switched off. The fan then helps move fresh air through the room.",
    [
        ("Why is the fan not aimed at the sawdust?", "Blowing dust into the air makes it harder to breathe and to see.", ["The doorway is the only place with electricity.", "The fan is broken.", "Sawdust should be saved in the air."], "cause"),
        ("When do students sweep?", "After the tools are switched off.", ["While the saw is still running.", "Before they enter the room for the first time only.", "Instead of using the fan at any time."], "sequence"),
    ],
)
_add_passage(
    "Market stall",
    "Every Sunday, Ms. Bennett sells jars of honey at the market. She arrives early to claim the same corner stall. Regular customers know she leaves when the jars are gone, which is often before 1 p.m. This week she brought four extra jars because the previous week had sold out.",
    [
        ("Why did she bring four extra jars?", "The previous week had sold out.", ["The stall moved to a new street.", "Customers asked her to stay past evening.", "The market opened at 1 p.m."], "cause"),
        ("The passage suggests that regular customers", "know she may leave before 1 p.m.", ["help her make the honey.", "reserve the corner stall for her.", "buy only in the evening."], "inference"),
    ],
)
_add_passage(
    "Code of the shop",
    "The auto shop posts a simple code by the door: return tools to the marked drawer, wipe up spills at once, and tell a lead technician about any damaged part. New hires read the code on their first morning. The lead technician said the rules prevent lost time more than they restrict people.",
    [
        ("What should a worker do about a damaged part?", "Tell a lead technician.", ["Hide it in a drawer.", "Wipe it and keep working without a word.", "Take it home."], "stated detail"),
        ("According to the lead technician, the rules mainly", "prevent lost time.", ["restrict people for its own sake.", "replace the need for training.", "apply only to new hires."], "paraphrase"),
    ],
)
_add_passage(
    "Satellite club",
    "The after-school satellite club meets when the sky is clear enough to test the small antenna. On cloudy days the members stay inside and calculate where the satellite should pass. They record both the prediction and the actual time once the sky allows a test. The differences help them adjust the next calculation.",
    [
        ("What do members do on cloudy days?", "They calculate where the satellite should pass.", ["They cancel the club for the month.", "They test the antenna in the rain.", "They ignore the predictions."], "stated detail"),
        ("Why do they record the difference between prediction and actual time?", "To adjust the next calculation.", ["To prove the antenna is broken.", "To choose a new school.", "To avoid meeting outside."], "purpose"),
    ],
)
_add_passage(
    "Lost badge",
    "Visitors to the research lab must wear a badge. When Mr. Cole realized his badge was still in his car, he returned to the parking lot before entering the hallway. The receptionist would not open the inner door without it. He was late to the meeting by six minutes, but he followed the rule.",
    [
        ("Why did Mr. Cole go back to the car?", "His badge was there.", ["The meeting had moved to the parking lot.", "The receptionist asked him to move the car.", "He needed a new coat."], "cause"),
        ("The passage shows that Mr. Cole", "followed the badge rule even though he was late.", ["entered the hallway without a badge.", "skipped the meeting.", "arrived six minutes early."], "inference"),
    ],
)
_add_passage(
    "Canning tomatoes",
    "Grandmother canned tomatoes on a Saturday when the fruit was ripe but still firm. She discarded three tomatoes with soft spots. The rest were washed, packed into jars, and processed in boiling water for the time listed on her chart. She labeled each jar with the date.",
    [
        ("Which tomatoes did she discard?", "Three with soft spots.", ["All of the ripe fruit.", "The jars without labels.", "Those that were still firm."], "stated detail"),
        ("Why did she look at her chart?", "It listed the processing time.", ["It named the discarded tomatoes.", "It gave the market price.", "It replaced the labels."], "purpose"),
    ],
)
_add_passage(
    "New stop sign",
    "The town installed a stop sign at the corner of Pine and Third after several near misses. Drivers who used to roll through the intersection must now come to a full stop. The police plan to give warnings during the first week and tickets after that. A flashing light was considered but not installed.",
    [
        ("What change must drivers make?", "They must come to a full stop.", ["They must ignore the corner.", "They must follow a flashing light.", "They must use only Pine Street."], "stated detail"),
        ("What was considered but not installed?", "A flashing light.", ["The stop sign.", "A police station.", "A new street name."], "stated detail"),
    ],
)
_add_passage(
    "Study group",
    "Four students meet in the library after geometry class. They redo any problem that more than one person missed. If everyone solved a problem the same way, they spend only a minute checking it. Last Thursday they spent most of the hour on a single proof about similar triangles.",
    [
        ("Which problems get the most attention?", "Problems that more than one person missed.", ["Problems everyone solved the same way.", "Only problems from history class.", "Problems they have already mastered."], "stated detail"),
        ("What did the group focus on last Thursday?", "A proof about similar triangles.", ["A one-minute review of every problem.", "An essay for English.", "A map of the library."], "stated detail"),
    ],
)
_add_passage(
    "Cargo net",
    "Before the truck left the loading dock, the driver checked the cargo net. One hook was not attached to the rail. He fastened it and tugged the net to be sure it was tight. The dispatcher held the paperwork until that check was finished. The truck departed ten minutes later.",
    [
        ("What was wrong when the driver first checked?", "One hook was not attached to the rail.", ["The paperwork was missing.", "The net was too tight to move.", "The truck had already departed."], "stated detail"),
        ("Why did the dispatcher hold the paperwork?", "The cargo check was not finished yet.", ["The driver refused the load.", "The rail was being replaced.", "The truck had no net at all."], "cause"),
    ],
)
_add_passage(
    "Bird count",
    "Volunteers counted birds along the river for one hour at sunrise. They recorded 14 herons and 6 kingfishers. A week earlier, at the same hour, they had recorded 9 herons and 11 kingfishers. The organizer warned that one hour is only a sample, not a full census of the river.",
    [
        ("How many herons were recorded in the latest count?", "14.", ["9.", "6.", "11."], "stated detail"),
        ("What warning did the organizer give?", "One hour is only a sample, not a full census.", ["Kingfishers have left the river permanently.", "Herons should not be counted.", "The sunrise count must last all day."], "stated detail"),
    ],
)
_add_passage(
    "Glove rule",
    "In the electronics bay, technicians wear an anti-static wrist strap when they handle a circuit board. The strap connects them to a grounded mat. Without it, a small static charge could damage a chip that still looks perfect. The rule applies even when the technician is only moving the board to another bench.",
    [
        ("What is the wrist strap connected to?", "A grounded mat.", ["The nearest window.", "A damaged chip.", "Another technician."], "stated detail"),
        ("When does the rule apply?", "Even when a board is only being moved to another bench.", ["Only when a chip already looks damaged.", "Only during the first minute of the shift.", "Only if the technician refuses the mat."], "scope"),
    ],
)
_add_passage(
    "Farmers' forecast",
    "The county agent told farmers to delay cutting hay because rain was likely that night. Wet hay can mold in the barn. Most farmers waited. One field was cut anyway, and the owner covered the bales with tarps before the rain arrived. The agent planned to check that field the next day.",
    [
        ("Why did the agent recommend a delay?", "Rain was likely, and wet hay can mold.", ["The tarps were missing from the store.", "The barn was already full of moldy hay.", "Most farmers had finished cutting."], "cause"),
        ("What did one owner do after cutting anyway?", "Covered the bales with tarps.", ["Left the hay in the rain on purpose.", "Sold the field the same night.", "Ignored the next day's visit."], "stated detail"),
    ],
)
_add_passage(
    "Ticket window",
    "The arena opens the ticket window at 6 p.m., one hour before the game. People who already have tickets may enter through the side gate at 6:30 p.m. The main doors open at 6:45 p.m. Bags larger than a small purse are not allowed inside.",
    [
        ("When does the ticket window open?", "At 6 p.m.", ["At 6:30 p.m.", "At 6:45 p.m.", "One hour after the game."], "stated detail"),
        ("Who may use the side gate at 6:30 p.m.?", "People who already have tickets.", ["Only people buying tickets at that moment.", "Anyone with a large bag.", "Only the players."], "stated detail"),
    ],
)
_add_passage(
    "Roof patch",
    "After a windstorm, Mr. Patel found a loose shingle above the kitchen. He could not climb the roof safely by himself, so he called a roofer the same day. Until the repair, he placed a bucket under the stain on the ceiling. The roofer replaced three shingles the next morning, and the ceiling stayed dry during the following rain.",
    [
        ("Why did Mr. Patel call a roofer?", "He could not climb the roof safely by himself.", ["The kitchen bucket was broken.", "Three shingles had already been replaced.", "The ceiling stain was only paint."], "cause"),
        ("What showed that the repair worked?", "The ceiling stayed dry during the following rain.", ["The bucket overflowed.", "The windstorm returned that morning.", "The loose shingle was left in place."], "evidence"),
    ],
)
_add_passage(
    "Language lab",
    "The language lab keeps headphones in numbered slots. Students sign a card when they take a pair and return it to the same slot. If a plug is bent, they place the headphones in the repair bin instead. The attendant checks the bin at the end of the day.",
    [
        ("What should a student do with a bent plug?", "Place the headphones in the repair bin.", ["Return them to any slot.", "Take them home.", "Sign the card and keep using them."], "stated rule"),
        ("When does the attendant check the repair bin?", "At the end of the day.", ["Each time a student signs a card.", "Before the headphones are numbered.", "Only when a slot is empty in the morning."], "stated detail"),
    ],
)
_add_passage(
    "Creek crossing",
    "The trail crosses a creek on stepping stones. After the spring flood, two stones shifted and the gap became too wide for a safe step. Rangers marked the spot with tape and directed hikers to a downstream footbridge. They plan to reset the stones when the water is lower.",
    [
        ("What made the crossing unsafe?", "Two stones shifted and the gap became too wide.", ["The footbridge collapsed.", "Hikers removed the tape.", "The creek dried up."], "cause"),
        ("What is the temporary route?", "A downstream footbridge.", ["The same stones.", "A new road through the creek.", "The ranger station only."], "stated detail"),
    ],
)
_add_passage(
    "Budget note",
    "The club treasurer reported that dues covered the room rental but not the cost of new music folders. Members voted to hold a bake sale rather than raise dues. The sale is scheduled for the Saturday before the concert. Any money left over will buy extra folders for the next term.",
    [
        ("What did the dues fail to cover?", "The cost of new music folders.", ["The room rental.", "The concert tickets.", "The treasurer's report."], "stated detail"),
        ("What will leftover money buy?", "Extra folders for the next term.", ["A larger room.", "Lower dues for the past year.", "Tickets to another club's concert."], "stated detail"),
    ],
)
_add_passage(
    "Cooling system",
    "The mechanic explained that the thermostat stays closed while the engine is cold so the coolant can heat quickly. Once the engine reaches operating temperature, the thermostat opens and coolant flows through the radiator. A thermostat stuck open can make the engine warm up slowly. A thermostat stuck closed can make it overheat.",
    [
        ("What happens when the engine reaches operating temperature?", "The thermostat opens and coolant flows through the radiator.", ["The thermostat stays closed for the rest of the trip.", "The radiator is removed.", "Coolant stops moving."], "process"),
        ("What can a thermostat stuck closed cause?", "The engine can overheat.", ["The engine will warm up more slowly and stay cool.", "The coolant will bypass every hose.", "The radiator will empty at once."], "cause and effect"),
    ],
)


_add_passage(
    "Map scale",
    "The trail map uses a scale in which one inch represents two miles. A marked route on the map is three inches long. The legend also shows that a dashed line means a seasonal closure. Hikers who want the open route follow the solid line instead.",
    [
        ("How many miles does the three-inch route represent?", "6 miles.", ["2 miles.", "3 miles.", "5 miles."], "computation from the passage"),
        ("What does a dashed line mean on this map?", "A seasonal closure.", ["An open route.", "A distance of one inch.", "A solid bridge."], "stated detail"),
    ],
)
_add_passage(
    "Shift bell",
    "The machine shop rings a bell five minutes before the end of the shift so workers can put tools away. The bell at noon is only the lunch signal, not the cleanup signal. New employees sometimes confuse the two. A poster by the clock explains the difference.",
    [
        ("What is the five-minute bell for?", "Putting tools away before the shift ends.", ["Starting lunch at noon.", "Opening the shop in the morning.", "Testing the fire alarm."], "stated detail"),
        ("Why is the poster by the clock?", "It explains the difference between the signals.", ["It lists the price of tools.", "It replaces the noon bell.", "It shows the map of the town."], "purpose"),
    ],
)


def passage_items(limit: int, seen: set[str]) -> list[dict]:
    rng = random.Random(8088)
    rows = []
    index = 1
    vocab_bank = {
        "shift": _tri("A scheduled period of work.", "Um período marcado de trabalho.", "Un período programado de trabajo."),
        "shipment": _tri("Goods sent from one place to another.", "Mercadorias enviadas de um lugar a outro.", "Mercancías enviadas de un lugar a otro."),
    }
    for passage in PASSAGES:
        marked = passage["text"]
        for question, correct, wrongs, concept in passage["questions"]:
            terms = []
            for term, text in vocab_bank.items():
                if f"[[{term}]]" in marked:
                    terms.append({"term": term, "text": text})
            strategy = {
                "quick": _tri(
                    "The answer must come from the passage. Do not choose a statement that sounds likely but is not supported.",
                    "A resposta precisa sair do texto. Não escolha uma frase que apenas pareça provável.",
                    "La respuesta tiene que salir del texto. No elija una frase que solo parezca probable.",
                ),
                "method": _tri(
                    "Find the sentence that mentions the same people, times, or objects as the question. Then compare each choice with that sentence.",
                    "Ache a frase que menciona as mesmas pessoas, horários ou objetos da pergunta. Depois compare cada alternativa com essa frase.",
                    "Encuentre la oración que menciona a las mismas personas, horas u objetos de la pregunta. Luego compare cada opción con esa oración.",
                ),
                "step": _tri(
                    f"The passage supports this choice: {correct}",
                    f"O texto sustenta esta alternativa: {correct}",
                    f"El texto respalda esta opción: {correct}",
                ),
            }
            row = make_item(
                external_key=f"pc-{index:04d}",
                subject="PC",
                stem=question,
                correct=correct,
                wrongs=wrongs,
                difficulty="MEDIUM" if concept in {"inference", "purpose", "comparison"} else "EASY",
                topic=concept,
                strategy=strategy,
                explain=_tri(
                    f"The passage supports the choice “{correct}”.",
                    f"O texto sustenta a alternativa “{correct}”.",
                    f"El texto respalda la opción “{correct}”.",
                ),
                concept={
                    "stated detail": _tri("Stated detail", "Detalhe explícito", "Detalle explícito"),
                    "time order": _tri("Time order", "Ordem temporal", "Orden temporal"),
                    "purpose": _tri("Author's purpose", "Propósito", "Propósito"),
                    "main idea": _tri("Main idea", "Ideia principal", "Idea principal"),
                    "stated rule": _tri("Stated rule", "Regra explícita", "Regla explícita"),
                    "cause": _tri("Cause", "Causa", "Causa"),
                    "inference": _tri("Supported inference", "Inferência sustentada", "Inferencia respaldada"),
                    "comparison": _tri("Comparison", "Comparação", "Comparación"),
                    "sequence": _tri("Sequence", "Sequência", "Secuencia"),
                    "function": _tri("Function", "Função", "Función"),
                    "cause and effect": _tri("Cause and effect", "Causa e efeito", "Causa y efecto"),
                    "computation from the passage": _tri("Computation from the passage", "Cálculo a partir do texto", "Cálculo a partir del texto"),
                    "process": _tri("Process", "Processo", "Proceso"),
                    "reason": _tri("Reason", "Razão", "Razón"),
                    "paraphrase": _tri("Paraphrase", "Paráfrase", "Paráfrasis"),
                    "scope": _tri("Scope of a rule", "Alcance de uma regra", "Alcance de una regla"),
                    "evidence": _tri("Evidence", "Evidência", "Evidencia"),
                }.get(concept, _tri(concept, concept, concept)),
                why_wrong=_tri(
                    "This choice conflicts with the passage or adds a fact the passage does not give.",
                    "Esta alternativa contradiz o texto ou acrescenta um fato que o texto não traz.",
                    "Esta opción contradice el texto o añade un dato que el texto no da.",
                ),
                rng=rng,
                passage=marked,
                vocab=terms,
            )
            rows.append(row)
            index += 1
    if len(PASSAGES) < 50:
        raise RuntimeError(f"Expected at least 50 passages, found {len(PASSAGES)}")
    return take_unique(rows, limit, seen)
