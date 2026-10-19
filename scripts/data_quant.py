"""Original arithmetic and mathematics items with computed keys."""

from __future__ import annotations

import random

from bank_common import make_item

NAMES = ["Luis", "Priya", "Noah", "Aisha", "Elena", "Marcus", "Hana", "Owen", "Sofia", "Jamal"]


def _tri(en: str, pt: str, es: str) -> dict[str, str]:
    return {"en": en, "pt-BR": pt, "es": es}


def _strategy(quick, method, step) -> dict:
    return {"quick": _tri(*quick), "method": _tri(*method), "step": _tri(*step)}


def _wrong(en: str, pt: str, es: str) -> dict[str, str]:
    return _tri(en, pt, es)


def _num_item(key, subject, stem, answer, wrongs, difficulty, topic, strategy, explain, concept, rng, vocab=None):
    return make_item(
        external_key=key,
        subject=subject,
        stem=stem,
        correct=str(answer),
        wrongs=[str(value) for value in wrongs],
        difficulty=difficulty,
        topic=topic,
        strategy=strategy,
        explain=explain,
        concept=concept,
        why_wrong=_wrong(
            "This value comes from using the wrong operation or stopping after only part of the work.",
            "Esse valor nasce da operação errada ou de parar antes de terminar o raciocínio.",
            "Ese valor sale de la operación equivocada o de detenerse antes de terminar el razonamiento.",
        ),
        rng=rng,
        vocab=vocab,
    )


def _distinct_wrongs(answer: int, candidates: list[int]) -> list[int]:
    seen = {answer}
    wrongs = []
    for value in candidates:
        if value in seen or value < 0:
            continue
        seen.add(value)
        wrongs.append(value)
        if len(wrongs) == 3:
            return wrongs
    probe = answer + 1
    while len(wrongs) < 3:
        if probe not in seen and probe >= 0:
            wrongs.append(probe)
            seen.add(probe)
        probe += 1
    return wrongs


def arithmetic_items(limit: int, seen: set[str]) -> list[dict]:
    from bank_common import take_unique

    rng = random.Random(2101)
    rows = []
    index = 1

    def add(row):
        nonlocal index
        row["externalKey"] = f"ar-{index:04d}"
        index += 1
        rows.append(row)

    for groups in range(3, 18):
        for size in range(4, 16):
            answer = groups * size
            name = NAMES[(groups + size) % len(NAMES)]
            stem = (
                f"{name} packs [[identical]] supply kits into {groups} cartons, "
                f"with {size} kits in every carton. How many kits is that in all?"
            )
            wrongs = _distinct_wrongs(answer, [groups + size, answer + groups, abs(answer - size), groups * (size + 1)])
            add(
                _num_item(
                    "",
                    "AR",
                    stem,
                    answer,
                    wrongs,
                    "EASY",
                    "equal-groups",
                    _strategy(
                        (
                            "Equal groups call for multiplication, not addition.",
                            "Grupos iguais pedem multiplicação, não adição.",
                            "Los grupos iguales piden multiplicación, no suma.",
                        ),
                        (
                            f"Multiply the number of cartons by the number of kits in each carton.",
                            "Multiplique o número de caixas pela quantidade de kits em cada caixa.",
                            "Multiplique el número de cajas por la cantidad de kits en cada caja.",
                        ),
                        (
                            f"Compute {groups} × {size} = {answer}.",
                            f"Calcule {groups} × {size} = {answer}.",
                            f"Calcule {groups} × {size} = {answer}.",
                        ),
                    ),
                    _tri(
                        f"{groups} equal cartons of {size} kits give {groups} × {size} = {answer} kits.",
                        f"{groups} caixas iguais com {size} kits dão {groups} × {size} = {answer} kits.",
                        f"{groups} cajas iguales con {size} kits dan {groups} × {size} = {answer} kits.",
                    ),
                    _tri("Multiplication of equal groups", "Multiplicação de grupos iguais", "Multiplicación de grupos iguales"),
                    rng,
                    vocab=[
                        {
                            "term": "identical",
                            "text": _tri(
                                "Exactly the same; here, every kit matches the others.",
                                "Idêntico: aqui, cada kit é igual aos outros.",
                                "Idéntico: aquí, cada kit es igual a los demás.",
                            ),
                        }
                    ],
                )
            )

    for rate in (12, 15, 18, 24, 36, 40, 45, 48, 54, 60):
        for hours in (2, 3, 4, 5, 6, 8):
            answer = rate * hours
            stem = (
                f"A conveyor moves {rate} [[components]] per hour at a steady rate. "
                f"How many components does it move in {hours} hours?"
            )
            wrongs = _distinct_wrongs(answer, [rate + hours, answer + rate, rate * (hours - 1), answer - hours])
            add(
                _num_item(
                    "",
                    "AR",
                    stem,
                    answer,
                    wrongs,
                    "EASY",
                    "rate",
                    _strategy(
                        (
                            "Rate times time gives the total when the rate stays constant.",
                            "Taxa vezes tempo dá o total quando a taxa é constante.",
                            "La tasa por el tiempo da el total cuando la tasa es constante.",
                        ),
                        (
                            "Multiply components per hour by the number of hours.",
                            "Multiplique os componentes por hora pelo número de horas.",
                            "Multiplique los componentes por hora por el número de horas.",
                        ),
                        (
                            f"{rate} × {hours} = {answer}.",
                            f"{rate} × {hours} = {answer}.",
                            f"{rate} × {hours} = {answer}.",
                        ),
                    ),
                    _tri(
                        f"At {rate} components each hour for {hours} hours, the total is {answer}.",
                        f"A {rate} componentes por hora durante {hours} horas, o total é {answer}.",
                        f"A {rate} componentes por hora durante {hours} horas, el total es {answer}.",
                    ),
                    _tri("Distance or output = rate × time", "Produção = taxa × tempo", "Producción = tasa × tiempo"),
                    rng,
                    vocab=[
                        {
                            "term": "components",
                            "text": _tri(
                                "Parts that will be used in a larger assembly.",
                                "Peças que entram numa montagem maior.",
                                "Piezas que entran en un montaje mayor.",
                            ),
                        }
                    ],
                )
            )

    for price in (3, 4, 5, 6, 8, 9, 12, 15):
        for qty in (2, 3, 4, 5, 6, 7, 8):
            for off in (1, 2):
                if off >= price:
                    continue
                answer = (price - off) * qty
                stem = (
                    f"A tool costs ${price}. During a sale the price is reduced by ${off}. "
                    f"What is the total cost of {qty} tools at the sale price?"
                )
                full = price * qty
                wrongs = _distinct_wrongs(answer, [full, full - off, price * qty - price, (price - off) * (qty - 1)])
                add(
                    _num_item(
                        "",
                        "AR",
                        stem,
                        answer,
                        wrongs,
                        "MEDIUM",
                        "discount",
                        _strategy(
                            (
                                "First find the sale price of one tool. Then multiply by the quantity.",
                                "Primeiro ache o preço de um item na promoção. Depois multiplique pela quantidade.",
                                "Primero halle el precio de una unidad en oferta. Después multiplique por la cantidad.",
                            ),
                            (
                                f"Subtract the discount from ${price}, then multiply by {qty}. Do not subtract the discount only once from the grand total unless you mean to.",
                                f"Subtraia o desconto de ${price} e depois multiplique por {qty}.",
                                f"Reste el descuento de ${price} y después multiplique por {qty}.",
                            ),
                            (
                                f"Sale price = {price} − {off} = {price - off}. Total = {price - off} × {qty} = {answer}.",
                                f"Preço promocional = {price} − {off} = {price - off}. Total = {price - off} × {qty} = {answer}.",
                                f"Precio de oferta = {price} − {off} = {price - off}. Total = {price - off} × {qty} = {answer}.",
                            ),
                        ),
                        _tri(
                            f"Each tool costs ${price - off} after the reduction, so {qty} tools cost ${answer}.",
                            f"Cada ferramenta fica por ${price - off} após a redução, então {qty} custam ${answer}.",
                            f"Cada herramienta queda en ${price - off} tras la reducción, así que {qty} cuestan ${answer}.",
                        ),
                        _tri("Two-step money problem", "Problema de dinheiro em duas etapas", "Problema de dinero en dos pasos"),
                        rng,
                    )
                )

    for total in (24, 30, 36, 40, 48, 56, 60, 72, 80, 90):
        for part in (2, 3, 4, 5, 6, 8):
            if total % part != 0:
                continue
            share = total // part
            removed = share
            answer = total - removed
            stem = (
                f"A crew has {total} [[fasteners]]. They set aside 1/{part} of them for a later job. "
                f"How many fasteners remain available now?"
            )
            wrongs = _distinct_wrongs(answer, [share, total - part, total // (part + 1) if part < 8 else share + 1, answer - part])
            add(
                _num_item(
                    "",
                    "AR",
                    stem,
                    answer,
                    wrongs,
                    "MEDIUM",
                    "fraction-of-a-quantity",
                    _strategy(
                        (
                            "A unit fraction means divide the whole into that many equal parts.",
                            "Uma fração unitária manda dividir o todo nessa quantidade de partes iguais.",
                            "Una fracción unitaria indica dividir el total en esa cantidad de partes iguales.",
                        ),
                        (
                            f"Find 1/{part} of {total}, then subtract that amount from {total}.",
                            f"Ache 1/{part} de {total} e subtraia esse valor de {total}.",
                            f"Halle 1/{part} de {total} y reste esa cantidad de {total}.",
                        ),
                        (
                            f"1/{part} of {total} = {share}. Remaining = {total} − {share} = {answer}.",
                            f"1/{part} de {total} = {share}. Restante = {total} − {share} = {answer}.",
                            f"1/{part} de {total} = {share}. Restante = {total} − {share} = {answer}.",
                        ),
                    ),
                    _tri(
                        f"One part is {share} fasteners, so the fasteners still available are {answer}.",
                        f"Uma parte tem {share} fixadores, então ainda há {answer} disponíveis.",
                        f"Una parte tiene {share} sujetadores, así que todavía hay {answer} disponibles.",
                    ),
                    _tri("Fraction of a whole", "Fração de um total", "Fracción de un total"),
                    rng,
                    vocab=[
                        {
                            "term": "fasteners",
                            "text": _tri(
                                "Hardware used to hold parts together, such as bolts or screws.",
                                "Peças que unem componentes, como parafusos e porcas.",
                                "Piezas que unen componentes, como tornillos y tuercas.",
                            ),
                        }
                    ],
                )
            )

    for a, b, c in ((18, 24, 30), (20, 28, 36), (15, 25, 35), (12, 16, 20), (22, 26, 30), (40, 50, 60), (8, 14, 20), (11, 17, 23)):
        answer = round((a + b + c) / 3)
        if (a + b + c) % 3 != 0:
            continue
        stem = f"The scores on three quizzes are {a}, {b}, and {c}. What is the average score?"
        wrongs = _distinct_wrongs(answer, [a + b + c, a + b - c, max(a, b, c), answer + 2])
        add(
            _num_item(
                "",
                "AR",
                stem,
                answer,
                wrongs,
                "EASY",
                "average",
                _strategy(
                    (
                        "The average is the total divided by how many numbers you added.",
                        "A média é o total dividido por quantos números foram somados.",
                        "El promedio es el total dividido por cuántos números se sumaron.",
                    ),
                    (
                        "Add the three scores, then divide by 3.",
                        "Some as três notas e divida por 3.",
                        "Sume las tres puntuaciones y divida entre 3.",
                    ),
                    (
                        f"({a} + {b} + {c}) ÷ 3 = {a + b + c} ÷ 3 = {answer}.",
                        f"({a} + {b} + {c}) ÷ 3 = {a + b + c} ÷ 3 = {answer}.",
                        f"({a} + {b} + {c}) ÷ 3 = {a + b + c} ÷ 3 = {answer}.",
                    ),
                ),
                _tri(
                    f"The sum is {a + b + c}, and dividing by 3 gives {answer}.",
                    f"A soma é {a + b + c}, e dividir por 3 dá {answer}.",
                    f"La suma es {a + b + c}, y dividir entre 3 da {answer}.",
                ),
                _tri("Arithmetic mean", "Média aritmética", "Media aritmética"),
                rng,
            )
        )

    for miles in (120, 150, 180, 210, 240, 300):
        for hours in (2, 3, 4, 5, 6):
            if miles % hours != 0:
                continue
            answer = miles // hours
            stem = (
                f"A delivery van travels {miles} miles in {hours} hours at a constant speed. "
                f"What is its speed in miles per hour?"
            )
            wrongs = _distinct_wrongs(answer, [miles * hours, miles - hours, answer + hours, miles // (hours + 1) if miles % (hours + 1) == 0 else answer + 5])
            add(
                _num_item(
                    "",
                    "AR",
                    stem,
                    answer,
                    wrongs,
                    "EASY",
                    "speed",
                    _strategy(
                        (
                            "Speed is distance divided by time when the speed is constant.",
                            "Velocidade é distância dividida pelo tempo quando a velocidade é constante.",
                            "La velocidad es distancia dividida entre el tiempo cuando es constante.",
                        ),
                        (
                            f"Divide {miles} miles by {hours} hours.",
                            f"Divida {miles} milhas por {hours} horas.",
                            f"Divida {miles} millas entre {hours} horas.",
                        ),
                        (
                            f"{miles} ÷ {hours} = {answer} miles per hour.",
                            f"{miles} ÷ {hours} = {answer} milhas por hora.",
                            f"{miles} ÷ {hours} = {answer} millas por hora.",
                        ),
                    ),
                    _tri(
                        f"The van covers {answer} miles each hour.",
                        f"A van percorre {answer} milhas a cada hora.",
                        f"La furgoneta recorre {answer} millas cada hora.",
                    ),
                    _tri("Speed = distance ÷ time", "Velocidade = distância ÷ tempo", "Velocidad = distancia ÷ tiempo"),
                    rng,
                )
            )

    for base in (40, 60, 80, 100, 120, 200):
        for pct in (10, 15, 20, 25, 30):
            if (base * pct) % 100 != 0:
                continue
            answer = base * pct // 100
            stem = f"What is {pct} percent of {base}?"
            wrongs = _distinct_wrongs(answer, [base + pct, pct * 10, answer * 2, base // pct if pct and base % pct == 0 else answer + pct])
            add(
                _num_item(
                    "",
                    "AR",
                    stem,
                    answer,
                    wrongs,
                    "MEDIUM",
                    "percent",
                    _strategy(
                        (
                            "Percent means per hundred. Convert the percent to a fraction or a decimal before multiplying.",
                            "Por cento significa em cada cem. Converta o percentual antes de multiplicar.",
                            "Por ciento significa por cada cien. Convierta el porcentaje antes de multiplicar.",
                        ),
                        (
                            f"Compute {pct}/100 × {base}.",
                            f"Calcule {pct}/100 × {base}.",
                            f"Calcule {pct}/100 × {base}.",
                        ),
                        (
                            f"{pct}/100 × {base} = {answer}.",
                            f"{pct}/100 × {base} = {answer}.",
                            f"{pct}/100 × {base} = {answer}.",
                        ),
                    ),
                    _tri(
                        f"{pct} percent of {base} is {answer}.",
                        f"{pct} por cento de {base} é {answer}.",
                        f"El {pct} por ciento de {base} es {answer}.",
                    ),
                    _tri("Percent of a number", "Porcentagem de um número", "Porcentaje de un número"),
                    rng,
                )
            )

    for length in (8, 10, 12, 15, 18, 20):
        for width in (4, 5, 6, 7, 9):
            answer = 2 * (length + width)
            stem = (
                f"A rectangular workbench is {length} feet long and {width} feet wide. "
                f"How many feet of edging are needed to go around it once?"
            )
            wrongs = _distinct_wrongs(answer, [length * width, length + width, 2 * length * width, answer + width])
            add(
                _num_item(
                    "",
                    "AR",
                    stem,
                    answer,
                    wrongs,
                    "MEDIUM",
                    "perimeter",
                    _strategy(
                        (
                            "Going around a rectangle once is the perimeter, not the area.",
                            "Dar a volta no retângulo uma vez é o perímetro, não a área.",
                            "Rodear el rectángulo una vez es el perímetro, no el área.",
                        ),
                        (
                            "Add the length and the width, then double that sum.",
                            "Some o comprimento e a largura e dobre essa soma.",
                            "Sume el largo y el ancho, y duplique esa suma.",
                        ),
                        (
                            f"2 × ({length} + {width}) = {answer} feet.",
                            f"2 × ({length} + {width}) = {answer} pés.",
                            f"2 × ({length} + {width}) = {answer} pies.",
                        ),
                    ),
                    _tri(
                        f"The perimeter is {answer} feet.",
                        f"O perímetro é {answer} pés.",
                        f"El perímetro es {answer} pies.",
                    ),
                    _tri("Rectangle perimeter", "Perímetro do retângulo", "Perímetro del rectángulo"),
                    rng,
                )
            )

    return take_unique(rows, limit, seen)


def math_items(limit: int, seen: set[str]) -> list[dict]:
    from bank_common import take_unique

    rng = random.Random(3407)
    rows = []
    index = 1

    def add(row):
        nonlocal index
        row["externalKey"] = f"mk-{index:04d}"
        index += 1
        rows.append(row)

    for a in (2, 3, 4, 5, 6, 8):
        for b in range(-9, 12):
            for x in range(2, 13):
                c = a * x + b
                stem = f"What is the value of x if {a}x + {b} = {c}?" if b >= 0 else f"What is the value of x if {a}x − {abs(b)} = {c}?"
                if b == 0:
                    stem = f"What is the value of x if {a}x = {c}?"
                wrongs = _distinct_wrongs(x, [c, a + x, x + b if b > 0 else x + 1, c - a])
                equation = f"{a}x + ({b}) = {c}"
                add(
                    _num_item(
                        "",
                        "MK",
                        stem,
                        x,
                        wrongs,
                        "EASY" if a <= 4 else "MEDIUM",
                        "linear-equation",
                        _strategy(
                            (
                                "Undo the operations in reverse order. Isolate the variable.",
                                "Desfaça as operações na ordem inversa. Isole a variável.",
                                "Deshaga las operaciones en orden inverso. Aísle la variable.",
                            ),
                            (
                                "Move the constant term to the other side, then divide by the coefficient of x.",
                                "Passe o termo constante para o outro lado e divida pelo coeficiente de x.",
                                "Pase el término constante al otro lado y divida entre el coeficiente de x.",
                            ),
                            (
                                f"From {equation}, x = {x}. Check: {a}×{x} + ({b}) = {c}.",
                                f"De {equation}, x = {x}. Confira: {a}×{x} + ({b}) = {c}.",
                                f"De {equation}, x = {x}. Compruebe: {a}×{x} + ({b}) = {c}.",
                            ),
                        ),
                        _tri(
                            f"Subtracting {b} from {c} and dividing by {a} gives x = {x}.",
                            f"Subtrair {b} de {c} e dividir por {a} dá x = {x}.",
                            f"Restar {b} de {c} y dividir entre {a} da x = {x}.",
                        ),
                        _tri("Linear equations", "Equações do primeiro grau", "Ecuaciones lineales"),
                        rng,
                    )
                )

    triples = ((3, 4, 5), (5, 12, 13), (6, 8, 10), (8, 15, 17), (7, 24, 25), (9, 12, 15), (20, 21, 29))
    for a, b, c in triples:
        stem = f"A right triangle has legs of {a} units and {b} units. What is the length of the hypotenuse?"
        wrongs = _distinct_wrongs(c, [a + b, a * b, c + a, abs(c - b)])
        add(
            _num_item(
                "",
                "MK",
                stem,
                c,
                wrongs,
                "MEDIUM",
                "pythagorean",
                _strategy(
                    (
                        "For a right triangle, the Pythagorean relation connects the two legs and the hypotenuse.",
                        "No triângulo retângulo, a relação de Pitágoras liga os catetos à hipotenusa.",
                        "En un triángulo rectángulo, la relación de Pitágoras une los catetos con la hipotenusa.",
                    ),
                    (
                        "Square each leg, add those squares, and take the square root.",
                        "Eleve cada cateto ao quadrado, some e extraia a raiz quadrada.",
                        "Eleve cada cateto al cuadrado, sume y extraiga la raíz cuadrada.",
                    ),
                    (
                        f"{a}² + {b}² = {a * a} + {b * b} = {c * c} = {c}², so the hypotenuse is {c}.",
                        f"{a}² + {b}² = {a * a} + {b * b} = {c * c} = {c}², então a hipotenusa mede {c}.",
                        f"{a}² + {b}² = {a * a} + {b * b} = {c * c} = {c}², así que la hipotenusa mide {c}.",
                    ),
                ),
                _tri(
                    f"The hypotenuse is {c} units.",
                    f"A hipotenusa mede {c} unidades.",
                    f"La hipotenusa mide {c} unidades.",
                ),
                _tri("Pythagorean theorem", "Teorema de Pitágoras", "Teorema de Pitágoras"),
                rng,
            )
        )

    for radius in (2, 3, 5, 6, 10):
        answer = radius * radius * 314
        stem = (
            f"Using 3.14 for π, what is the area of a circle with radius {radius}, "
            f"expressed in hundredths of a square unit (for example, 12.56 is written as 1256)?"
        )
        # Better to ask a clean integer form: area = πr^2 and options as decimals strings
        # I'll replace this approach below if the string answer leaks. Use integer circumference-style instead.
        del answer

    for radius in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10):
        answer = radius * radius
        stem = f"The area of a circle is πr². If the radius is {radius}, what is the value of r²?"
        wrongs = _distinct_wrongs(answer, [2 * radius, radius + radius, answer + radius, radius])
        add(
            _num_item(
                "",
                "MK",
                stem,
                answer,
                wrongs,
                "EASY",
                "circle-radius-squared",
                _strategy(
                    (
                        "The formula asks for the radius multiplied by itself before you involve π.",
                        "A fórmula pede o raio multiplicado por ele mesmo antes de usar π.",
                        "La fórmula pide el radio multiplicado por sí mismo antes de usar π.",
                    ),
                    (
                        f"Square the radius {radius}.",
                        f"Eleve o raio {radius} ao quadrado.",
                        f"Eleve el radio {radius} al cuadrado.",
                    ),
                    (
                        f"{radius}² = {answer}.",
                        f"{radius}² = {answer}.",
                        f"{radius}² = {answer}.",
                    ),
                ),
                _tri(
                    f"r² = {answer}. The area would then be {answer}π square units.",
                    f"r² = {answer}. A área seria {answer}π unidades quadradas.",
                    f"r² = {answer}. El área sería {answer}π unidades cuadradas.",
                ),
                _tri("Circle area formula", "Área do círculo", "Área del círculo"),
                rng,
            )
        )

    for n in (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12):
        answer = n * n
        stem = f"What is the value of {n} squared?"
        wrongs = _distinct_wrongs(answer, [n * 2, n * n + n, n * n - n, n * 3])
        add(
            _num_item(
                "",
                "MK",
                stem,
                answer,
                wrongs,
                "EASY",
                "exponents",
                _strategy(
                    (
                        "Squaring a number means multiplying it by itself once.",
                        "Elevar ao quadrado é multiplicar o número por ele mesmo uma vez.",
                        "Elevar al cuadrado es multiplicar el número por sí mismo una vez.",
                    ),
                    (
                        f"Compute {n} × {n}.",
                        f"Calcule {n} × {n}.",
                        f"Calcule {n} × {n}.",
                    ),
                    (
                        f"{n} × {n} = {answer}.",
                        f"{n} × {n} = {answer}.",
                        f"{n} × {n} = {answer}.",
                    ),
                ),
                _tri(f"{n} squared is {answer}.", f"{n} ao quadrado é {answer}.", f"{n} al cuadrado es {answer}."),
                _tri("Perfect squares", "Quadrados perfeitos", "Cuadrados perfectos"),
                rng,
            )
        )

    for length, width, height in ((2, 3, 4), (3, 3, 5), (4, 5, 2), (6, 2, 3), (5, 4, 2), (8, 2, 2), (7, 3, 2), (4, 4, 4)):
        answer = length * width * height
        stem = f"A rectangular box is {length} by {width} by {height} units. What is its volume?"
        wrongs = _distinct_wrongs(answer, [2 * (length + width + height), length * width, answer + height, length + width + height])
        add(
            _num_item(
                "",
                "MK",
                stem,
                answer,
                wrongs,
                "MEDIUM",
                "volume",
                _strategy(
                    (
                        "Volume of a rectangular box multiplies the three edge lengths.",
                        "O volume de um paralelepípedo multiplica as três arestas.",
                        "El volumen de un paralelepípedo multiplica las tres aristas.",
                    ),
                    (
                        "Multiply length × width × height.",
                        "Multiplique comprimento × largura × altura.",
                        "Multiplique largo × ancho × alto.",
                    ),
                    (
                        f"{length} × {width} × {height} = {answer}.",
                        f"{length} × {width} × {height} = {answer}.",
                        f"{length} × {width} × {height} = {answer}.",
                    ),
                ),
                _tri(
                    f"The volume is {answer} cubic units.",
                    f"O volume é {answer} unidades cúbicas.",
                    f"El volumen es {answer} unidades cúbicas.",
                ),
                _tri("Rectangular volume", "Volume do paralelepípedo", "Volumen del paralelepípedo"),
                rng,
            )
        )

    for angle in (20, 35, 40, 55, 65, 75, 80, 110, 125, 140):
        answer = 180 - angle
        stem = f"Two angles form a straight line. One angle measures {angle} degrees. What is the other angle?"
        wrongs = _distinct_wrongs(answer, [90 - angle if angle < 90 else angle - 90, 360 - angle, angle, answer + 10])
        add(
            _num_item(
                "",
                "MK",
                stem,
                answer,
                wrongs,
                "EASY",
                "supplementary-angles",
                _strategy(
                    (
                        "Angles that form a straight line are supplementary.",
                        "Ângulos que formam uma linha reta são suplementares.",
                        "Los ángulos que forman una línea recta son suplementarios.",
                    ),
                    (
                        "Subtract the given angle from 180 degrees.",
                        "Subtraia o ângulo dado de 180 graus.",
                        "Reste el ángulo dado de 180 grados.",
                    ),
                    (
                        f"180 − {angle} = {answer}.",
                        f"180 − {angle} = {answer}.",
                        f"180 − {angle} = {answer}.",
                    ),
                ),
                _tri(
                    f"The unknown angle measures {answer} degrees.",
                    f"O ângulo desconhecido mede {answer} graus.",
                    f"El ángulo desconocido mide {answer} grados.",
                ),
                _tri("Supplementary angles", "Ângulos suplementares", "Ángulos suplementarios"),
                rng,
            )
        )

    for base, height in ((6, 4), (8, 5), (10, 6), (12, 7), (14, 8), (9, 4), (15, 6), (7, 6), (11, 4), (13, 2)):
        if (base * height) % 2 != 0:
            continue
        answer = base * height // 2
        stem = f"What is the area of a triangle with base {base} and height {height}?"
        wrongs = _distinct_wrongs(answer, [base * height, base + height, answer * 2, answer + base])
        add(
            _num_item(
                "",
                "MK",
                stem,
                answer,
                wrongs,
                "MEDIUM",
                "triangle-area",
                _strategy(
                    (
                        "A triangle's area is half the product of its base and its matching height.",
                        "A área do triângulo é metade do produto da base pela altura correspondente.",
                        "El área del triángulo es la mitad del producto de la base por la altura correspondiente.",
                    ),
                    (
                        "Multiply base by height, then divide by 2.",
                        "Multiplique base por altura e divida por 2.",
                        "Multiplique base por altura y divida entre 2.",
                    ),
                    (
                        f"({base} × {height}) ÷ 2 = {answer}.",
                        f"({base} × {height}) ÷ 2 = {answer}.",
                        f"({base} × {height}) ÷ 2 = {answer}.",
                    ),
                ),
                _tri(
                    f"The area is {answer} square units.",
                    f"A área é {answer} unidades quadradas.",
                    f"El área es {answer} unidades cuadradas.",
                ),
                _tri("Triangle area", "Área do triângulo", "Área del triángulo"),
                rng,
            )
        )

    return take_unique(rows, limit, seen)
