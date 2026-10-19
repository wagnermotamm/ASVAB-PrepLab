"""Original science, technical, and spatial items."""

from __future__ import annotations

import random

from bank_common import make_item, take_unique

def _tri(en: str, pt: str, es: str) -> dict[str, str]:
    return {"en": en, "pt-BR": pt, "es": es}


QUICK = {
    "life": _tri(
        "Match the biological structure or process named in the question.",
        "Associe a estrutura ou o processo biológico pedido na questão.",
        "Relacione la estructura o el proceso biológico que pide la pregunta.",
    ),
    "earth": _tri(
        "Use the Earth-science definition, not an everyday guess.",
        "Use a definição das ciências da Terra, não um palpite cotidiano.",
        "Use la definición de las ciencias de la Tierra, no una suposición cotidiana.",
    ),
    "physical": _tri(
        "Identify the physical quantity first, then recall the relationship that defines it.",
        "Identifique primeiro a grandeza física e depois a relação que a define.",
        "Identifique primero la magnitud física y después la relación que la define.",
    ),
    "chem": _tri(
        "Decide whether the question asks for a substance, a change, or a particle.",
        "Decida se a questão pede uma substância, uma transformação ou uma partícula.",
        "Decida si la pregunta pide una sustancia, un cambio o una partícula.",
    ),
    "method": _tri(
        "Separate what the experimenter changes from what is measured.",
        "Separe o que o experimentador altera daquilo que é medido.",
        "Separe lo que el experimentador cambia de lo que se mide.",
    ),
    "auto": _tri(
        "Name the part by the job it does in the vehicle system.",
        "Identifique a peça pela função que ela cumpre no sistema do veículo.",
        "Identifique la pieza por la función que cumple en el sistema del vehículo.",
    ),
    "shop": _tri(
        "Match the tool or joint to the job described, and watch for look-alike tools.",
        "Associe a ferramenta ou a junta ao trabalho descrito e cuidado com ferramentas parecidas.",
        "Relacione la herramienta o la unión con el trabajo descrito y cuide las herramientas parecidas.",
    ),
    "electric": _tri(
        "Decide whether the question is about voltage, current, resistance, or a component's job.",
        "Decida se a questão trata de tensão, corrente, resistência ou da função de um componente.",
        "Decida si la pregunta trata de voltaje, corriente, resistencia o de la función de un componente.",
    ),
    "mech": _tri(
        "Look for the class of machine or the formula that fits the described setup.",
        "Procure a classe de máquina ou a fórmula que combina com a situação descrita.",
        "Busque la clase de máquina o la fórmula que corresponde a la situación descrita.",
    ),
}

METHOD = {
    "life": _tri(
        "Reject choices that belong to a different organ or that reverse the process.",
        "Descarte alternativas de outro órgão ou que invertam o processo.",
        "Descarte opciones de otro órgano o que inviertan el proceso.",
    ),
    "earth": _tri(
        "Place the event in the correct layer, cycle, or type of rock before choosing.",
        "Situe o evento na camada, no ciclo ou no tipo de rocha corretos antes de escolher.",
        "Sitúe el evento en la capa, el ciclo o el tipo de roca correctos antes de elegir.",
    ),
    "physical": _tri(
        "Write the defining relationship in words. Check units and what is held constant.",
        "Escreva a relação definidora em palavras. Confira as unidades e o que permanece constante.",
        "Escriba la relación definidora con palabras. Revise las unidades y lo que permanece constante.",
    ),
    "chem": _tri(
        "A chemical change makes a new substance. A physical change does not.",
        "Uma transformação química produz uma substância nova. Uma transformação física, não.",
        "Un cambio químico produce una sustancia nueva. Un cambio físico, no.",
    ),
    "method": _tri(
        "The independent variable is changed on purpose. The dependent variable is measured.",
        "A variável independente é alterada de propósito. A variável dependente é medida.",
        "La variable independiente se cambia a propósito. La variable dependiente se mide.",
    ),
    "auto": _tri(
        "Trace the system: air and fuel, ignition, cooling, lubrication, brakes, or drivetrain.",
        "Siga o sistema: ar e combustível, ignição, arrefecimento, lubrificação, freios ou transmissão.",
        "Siga el sistema: aire y combustible, encendido, refrigeración, lubricación, frenos o tren de transmisión.",
    ),
    "shop": _tri(
        "Ask what material is being cut or held, and whether the fastener is meant to come apart.",
        "Pergunte qual material será cortado ou preso e se o fixador deve poder ser desmontado.",
        "Pregunte qué material se corta o se sujeta y si el sujetador debe poder desmontarse.",
    ),
    "electric": _tri(
        "Use Ohm's law and the series or parallel rule that matches the circuit, without skipping the setup.",
        "Use a lei de Ohm e a regra de série ou paralelo que combina com o circuito, sem pular a montagem.",
        "Use la ley de Ohm y la regla de serie o paralelo que corresponde al circuito, sin saltarse el montaje.",
    ),
    "mech": _tri(
        "Balance the moments, or divide force by area, or compare gear sizes, depending on the setup.",
        "Equilibre os momentos, divida força por área ou compare o tamanho das engrenagens, conforme o caso.",
        "Equilibre los momentos, divida fuerza entre área o compare el tamaño de los engranajes, según el caso.",
    ),
}


def _rows_to_items(subject: str, rows: list[tuple], prefix: str, rng: random.Random) -> list[dict]:
    items = []
    for index, row in enumerate(rows, start=1):
        stem, correct, wrongs, topic, en, pt, es = row
        difficulty = ("EASY", "MEDIUM", "HARD")[index % 3]
        items.append(
            make_item(
                external_key=f"{prefix}-{index:04d}",
                subject=subject,
                stem=stem,
                correct=correct,
                wrongs=list(wrongs),
                difficulty=difficulty,
                topic=topic,
                strategy={"quick": QUICK[topic], "method": METHOD[topic], "step": _tri(en, pt, es)},
                explain=_tri(en, pt, es),
                concept=QUICK[topic],
                why_wrong=_tri(
                    "This choice names a different part, process, or relationship.",
                    "Esta alternativa aponta outra peça, outro processo ou outra relação.",
                    "Esta opción señala otra pieza, otro proceso u otra relación.",
                ),
                rng=rng,
            )
        )
    return items


def _load_facts(name: str) -> list[tuple]:
    from pathlib import Path
    blob = Path(__file__).with_name(name).read_text(encoding="utf-8")
    rows = []
    for line in blob.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("|")
        if len(parts) != 9:
            raise ValueError(f"{name}: expected 9 fields, got {len(parts)} in {line[:80]}")
        stem, correct, w1, w2, w3, topic, en, pt, es = [part.strip() for part in parts]
        rows.append((stem, correct, [w1, w2, w3], topic, en, pt, es))
    return rows


def science_items(limit: int, seen: set[str]) -> list[dict]:
    rng = random.Random(501)
    return take_unique(_rows_to_items("GS", _load_facts("facts_gs.txt"), "gs", rng), limit, seen)


def auto_items(limit: int, seen: set[str]) -> list[dict]:
    rng = random.Random(502)
    return take_unique(_rows_to_items("AI", _load_facts("facts_ai.txt"), "ai", rng), limit, seen)


def shop_items(limit: int, seen: set[str]) -> list[dict]:
    rng = random.Random(503)
    return take_unique(_rows_to_items("SI", _load_facts("facts_si.txt"), "si", rng), limit, seen)


def electronics_items(limit: int, seen: set[str]) -> list[dict]:
    rng = random.Random(504)
    conceptual = _rows_to_items("EI", _load_facts("facts_ei.txt"), "ei", rng)
    calculated = []
    number = 500
    for resistance in (2, 3, 4, 5, 6, 8, 10, 12):
        for current in (1, 2, 3, 4, 5):
            voltage = current * resistance
            stem = f"A resistor of {resistance} ohms carries a current of {current} amperes. What is the voltage across it, in volts?"
            wrongs = [str(value) for value in _wrongs(voltage, [current + resistance, voltage + current, resistance, max(voltage - resistance, 0)])]
            calculated.append(_calc("EI", f"ei-{number:04d}", stem, str(voltage), wrongs, "EASY" if voltage < 20 else "MEDIUM", "ohms-law", rng,
                _tri(
                    f"Ohm's law: voltage = current × resistance = {current} × {resistance} = {voltage} volts.",
                    f"Lei de Ohm: tensão = corrente × resistência = {current} × {resistance} = {voltage} volts.",
                    f"Ley de Ohm: voltaje = corriente × resistencia = {current} × {resistance} = {voltage} voltios.",
                )))
            number += 1
    for r1, r2 in ((2, 3), (4, 5), (6, 6), (8, 2), (10, 5), (12, 3), (7, 8), (9, 4)):
        total = r1 + r2
        stem = f"Two resistors, {r1} ohms and {r2} ohms, are connected in series. What is the total resistance, in ohms?"
        calculated.append(_calc("EI", f"ei-{number:04d}", stem, str(total), [str(v) for v in _wrongs(total, [r1 * r2, abs(r1 - r2), r1, total + 2])], "MEDIUM", "series-resistance", rng,
            _tri(
                f"Series resistances add: {r1} + {r2} = {total} ohms.",
                f"Resistências em série se somam: {r1} + {r2} = {total} ohms.",
                f"Las resistencias en serie se suman: {r1} + {r2} = {total} ohmios.",
            )))
        number += 1
    for r1, r2 in ((2, 2), (4, 4), (6, 3), (6, 6), (10, 10), (12, 4)):
        # parallel: product/sum must be integer
        if (r1 * r2) % (r1 + r2) != 0:
            continue
        total = (r1 * r2) // (r1 + r2)
        stem = f"Two resistors, {r1} ohms and {r2} ohms, are connected in parallel. What is the equivalent resistance, in ohms?"
        calculated.append(_calc("EI", f"ei-{number:04d}", stem, str(total), [str(v) for v in _wrongs(total, [r1 + r2, r1 * r2, abs(r1 - r2) or r1 + 1, total + r1])], "HARD", "parallel-resistance", rng,
            _tri(
                f"For two resistors in parallel, equivalent resistance = ({r1} × {r2}) / ({r1} + {r2}) = {total} ohms.",
                f"Para dois resistores em paralelo, a resistência equivalente = ({r1} × {r2}) / ({r1} + {r2}) = {total} ohms.",
                f"Para dos resistores en paralelo, la resistencia equivalente = ({r1} × {r2}) / ({r1} + {r2}) = {total} ohmios.",
            )))
        number += 1
    return take_unique(conceptual + calculated, limit, seen)


def mechanical_items(limit: int, seen: set[str]) -> list[dict]:
    rng = random.Random(505)
    conceptual = _rows_to_items("MC", _load_facts("facts_mc.txt"), "mc", rng)
    calculated = []
    number = 500
    for effort_arm, load_arm, load in ((4, 1, 80), (3, 1, 60), (5, 2, 40), (6, 2, 30), (8, 2, 25), (4, 2, 50), (10, 2, 20)):
        # effort * effort_arm = load * load_arm
        if (load * load_arm) % effort_arm != 0:
            continue
        effort = (load * load_arm) // effort_arm
        stem = (
            f"A first-class lever is balanced. The load of {load} pounds is {load_arm} foot from the fulcrum. "
            f"The effort is applied {effort_arm} feet from the fulcrum on the other side. What effort, in pounds, balances the load?"
        )
        calculated.append(_calc("MC", f"mc-{number:04d}", stem, str(effort), [str(v) for v in _wrongs(effort, [load, load * effort_arm, effort + load_arm, load * load_arm])], "MEDIUM", "lever", rng,
            _tri(
                f"Set effort × {effort_arm} = {load} × {load_arm}. Effort = {effort} pounds.",
                f"Faça esforço × {effort_arm} = {load} × {load_arm}. Esforço = {effort} libras.",
                f"Plantee esfuerzo × {effort_arm} = {load} × {load_arm}. Esfuerzo = {effort} libras.",
            )))
        number += 1
    for force, area in ((20, 2), (30, 3), (40, 4), (50, 5), (24, 4), (36, 6), (48, 8), (18, 2), (28, 4), (60, 5)):
        if force % area != 0:
            continue
        pressure = force // area
        stem = f"A force of {force} pounds is spread evenly over an area of {area} square inches. What is the pressure, in pounds per square inch?"
        calculated.append(_calc("MC", f"mc-{number:04d}", stem, str(pressure), [str(v) for v in _wrongs(pressure, [force * area, force + area, force, pressure + area])], "EASY", "pressure", rng,
            _tri(
                f"Pressure = force ÷ area = {force} ÷ {area} = {pressure} pounds per square inch.",
                f"Pressão = força ÷ área = {force} ÷ {area} = {pressure} libras por polegada quadrada.",
                f"Presión = fuerza ÷ área = {force} ÷ {area} = {pressure} libras por pulgada cuadrada.",
            )))
        number += 1
    for teeth_in, teeth_out, rpm_in in ((12, 24, 100), (10, 20, 80), (15, 30, 60), (8, 24, 90), (20, 10, 40), (18, 36, 50)):
        if (teeth_in * rpm_in) % teeth_out != 0:
            continue
        rpm_out = (teeth_in * rpm_in) // teeth_out
        stem = (
            f"A driving gear with {teeth_in} teeth turns at {rpm_in} revolutions per minute and meshes with a gear of {teeth_out} teeth. "
            f"How fast does the driven gear turn, in revolutions per minute?"
        )
        calculated.append(_calc("MC", f"mc-{number:04d}", stem, str(rpm_out), [str(v) for v in _wrongs(rpm_out, [rpm_in, teeth_in + teeth_out, rpm_in * 2, abs(rpm_in - teeth_out)])], "HARD", "gears", rng,
            _tri(
                f"Gear speeds are inversely proportional to teeth: {teeth_in} × {rpm_in} = {teeth_out} × output. Output = {rpm_out} rpm.",
                f"As rotações são inversamente proporcionais aos dentes: {teeth_in} × {rpm_in} = {teeth_out} × saída. Saída = {rpm_out} rpm.",
                f"Las revoluciones son inversamente proporcionales a los dientes: {teeth_in} × {rpm_in} = {teeth_out} × salida. Salida = {rpm_out} rpm.",
            )))
        number += 1
    for length, height, resistance in ((8, 2, 50), (6, 2, 40), (10, 2, 30), (12, 3, 45), (9, 3, 60), (4, 1, 80)):
        if (resistance * height) % length != 0:
            continue
        effort = (resistance * height) // length
        stem = (
            f"An inclined plane is {length} feet long and {height} feet high. "
            f"Ignoring friction, what effort in pounds, applied along the plane, moves a {resistance}-pound resistance?"
        )
        calculated.append(_calc("MC", f"mc-{number:04d}", stem, str(effort), [str(v) for v in _wrongs(effort, [resistance, resistance * length, effort + height, length * height])], "HARD", "inclined-plane", rng,
            _tri(
                f"Ideal effort × length = resistance × height. Effort = {resistance} × {height} / {length} = {effort} pounds.",
                f"No caso ideal, esforço × comprimento = resistência × altura. Esforço = {resistance} × {height} / {length} = {effort} libras.",
                f"En el caso ideal, esfuerzo × longitud = resistencia × altura. Esfuerzo = {resistance} × {height} / {length} = {effort} libras.",
            )))
        number += 1
    return take_unique(conceptual + calculated, limit, seen)


def _wrongs(answer: int, candidates: list[int]) -> list[int]:
    seen = {answer}
    picked = []
    for value in candidates:
        if value in seen or value < 0:
            continue
        seen.add(value)
        picked.append(value)
        if len(picked) == 3:
            return picked
    probe = answer + 1
    while len(picked) < 3:
        if probe not in seen:
            picked.append(probe)
            seen.add(probe)
        probe += 1
    return picked


def _calc(subject, key, stem, answer, wrongs, difficulty, topic, rng, step):
    return make_item(
        external_key=key,
        subject=subject,
        stem=stem,
        correct=answer,
        wrongs=wrongs,
        difficulty=difficulty,
        topic=topic,
        strategy={
            "quick": QUICK["electric" if subject == "EI" else "mech"],
            "method": METHOD["electric" if subject == "EI" else "mech"],
            "step": step,
        },
        explain=step,
        concept=QUICK["electric" if subject == "EI" else "mech"],
        why_wrong=_tri(
            "This value uses the wrong operation or stops before the relationship is applied.",
            "Esse valor usa a operação errada ou para antes de aplicar a relação.",
            "Ese valor usa la operación equivocada o se detiene antes de aplicar la relación.",
        ),
        rng=rng,
    )


def _svg(body: str, label: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" role="img">'
        f"<title>{label}</title>{body}</svg>"
    )


def assembling_items(limit: int, seen: set[str]) -> list[dict]:
    rng = random.Random(506)
    rows = []
    index = 1
    for width in range(28, 48):
        for height in (18, 24, 30):
            if index > limit + 5:
                break
            body_parts = (
                f'<rect x="50" y="18" width="{width}" height="16" fill="none" stroke="#0f3d3d" stroke-width="2" stroke-dasharray="4 3"/>'
                f'<rect x="50" y="70" width="{width}" height="{height}" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/>'
                f'<line x1="50" y1="70" x2="{50 + width}" y2="70" stroke="#b45309" stroke-width="3" stroke-dasharray="3 2"/>'
            )
            joined = (
                f'<polygon points="50,58 {50 + width // 2},30 {50 + width},58" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2"/>'
                f'<rect x="50" y="58" width="{width}" height="{height}" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/>'
            )
            apart = (
                f'<polygon points="20,20 {20 + width // 2},6 {20 + width},20" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2"/>'
                f'<rect x="70" y="70" width="{width}" height="{height}" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/>'
            )
            overlap = (
                f'<rect x="50" y="50" width="{width}" height="{height}" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/>'
                f'<polygon points="50,70 {50 + width // 2},42 {50 + width},70" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2"/>'
            )
            side = (
                f'<rect x="20" y="60" width="{width}" height="{height}" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/>'
                f'<polygon points="{24 + width},60 {24 + width + 16},48 {24 + width},78" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2"/>'
            )
            stem = (
                f"The rectangle is {width} units wide and {height} units tall. "
                f"Join the dashed base of the triangle to the dashed top edge of the rectangle. "
                f"Which figure shows that joint? Reference plate H{width}{height}."
            )
            diagrams = [
                _svg(joined, "Triangle seated on the top edge of the rectangle"),
                _svg(apart, "Triangle and rectangle still separated"),
                _svg(overlap, "Triangle overlapping the middle of the rectangle"),
                _svg(side, "Triangle attached to the side, not the dashed top"),
            ]
            rows.append(
                make_item(
                    external_key=f"ao-{index:04d}",
                    subject="AO",
                    stem=stem,
                    correct="Finished joint",
                    wrongs=["Separated parts", "Overlapping parts", "Side attachment"],
                    difficulty="MEDIUM" if width % 2 == 0 else "HARD",
                    topic="edge-join",
                    strategy={
                        "quick": _tri(
                            "Find the option where the two dashed edges touch and the other edges still form the original shapes.",
                            "Ache a opção em que as duas bordas tracejadas se tocam e as outras bordas ainda formam as formas originais.",
                            "Encuentre la opción en la que los dos bordes discontinuos se tocan y los demás bordes siguen formando las formas originales.",
                        ),
                        "method": _tri(
                            "The triangle should sit on the top edge. Reject overlaps, gaps, and a join on a different edge.",
                            "O triângulo deve ficar sobre a borda de cima. Descarte sobreposição, afastamento e junção em outra borda.",
                            "El triángulo debe quedar sobre el borde superior. Descarte superposición, separación y una unión en otro borde.",
                        ),
                        "step": _tri(
                            "The finished joint is the figure with the triangle seated on the rectangle's top edge.",
                            "A junção pronta é a figura com o triângulo assentado na borda de cima do retângulo.",
                            "La unión terminada es la figura con el triángulo asentado en el borde superior del rectángulo.",
                        ),
                    },
                    explain=_tri(
                        "The dashed edges are the top of the rectangle and the base of the triangle, so the triangle sits on that top edge.",
                        "As bordas tracejadas são o topo do retângulo e a base do triângulo, então o triângulo fica sobre esse topo.",
                        "Los bordes discontinuos son la parte superior del rectángulo y la base del triángulo, así que el triángulo queda sobre esa parte superior.",
                    ),
                    concept=_tri("Edge matching", "Encaixe de bordas", "Emparejamiento de bordes"),
                    why_wrong=_tri(
                        "This figure leaves a gap, covers the wrong edge, or attaches the triangle somewhere else.",
                        "Esta figura deixa um vão, cobre a borda errada ou prende o triângulo em outro lugar.",
                        "Esta figura deja un hueco, cubre el borde equivocado o une el triángulo en otro lugar.",
                    ),
                    rng=rng,
                    question_type="SPATIAL",
                    diagram_svg=_svg(body_parts, "Separate rectangle and the dashed edge that must be joined"),
                    option_diagrams=diagrams,
                )
            )
            index += 1
    for length in range(22, 46):
        if index > limit + 8:
            break
        left = f'<rect x="18" y="48" width="{length}" height="22" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/>'
        right = f'<rect x="{92}" y="48" width="{length}" height="22" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2"/>'
        mark = f'<line x1="{18 + length}" y1="48" x2="{18 + length}" y2="70" stroke="#b45309" stroke-width="3"/>'
        stimulus = left + right + mark
        joined = f'<rect x="20" y="48" width="{length}" height="22" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/><rect x="{20 + length}" y="48" width="{length}" height="22" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2"/>'
        gap = f'<rect x="16" y="48" width="{length}" height="22" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/><rect x="{70 + length}" y="48" width="{length}" height="22" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2"/>'
        stack = f'<rect x="40" y="30" width="{length}" height="22" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/><rect x="40" y="52" width="{length}" height="22" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2"/>'
        overlap = f'<rect x="30" y="48" width="{length}" height="22" fill="#d7efe9" stroke="#0f3d3d" stroke-width="2"/><rect x="{30 + length // 2}" y="48" width="{length}" height="22" fill="#f3e3c3" stroke="#0f3d3d" stroke-width="2" opacity="0.85"/>'
        stem = (
            f"Two bars are each {length} units long. Join the marked short end of the left bar to the left short end of the right bar "
            f"so they form one longer bar. Which figure shows that joint? Reference bar B{length}."
        )
        rows.append(
            make_item(
                external_key=f"ao-{index:04d}",
                subject="AO",
                stem=stem,
                correct="End-to-end bar",
                wrongs=["Bars still apart", "Bars stacked", "Bars overlapping"],
                difficulty="EASY" if length % 2 == 0 else "MEDIUM",
                topic="end-join",
                strategy={
                    "quick": _tri(
                        "The marked ends must touch. The finished piece should be one longer bar.",
                        "As extremidades marcadas devem se tocar. A peça pronta deve ser uma barra mais longa.",
                        "Los extremos marcados deben tocarse. La pieza terminada debe ser una barra más larga.",
                    ),
                    "method": _tri(
                        "Place the bars in one line. Reject a stack, an overlap, and a remaining gap.",
                        "Coloque as barras em uma linha. Descarte empilhamento, sobreposição e um vão restante.",
                        "Coloque las barras en una línea. Descarte un apilado, una superposición y un hueco restante.",
                    ),
                    "step": _tri(
                        "The correct figure is the single longer bar made by placing the short ends together.",
                        "A figura correta é a barra mais longa formada ao unir as extremidades curtas.",
                        "La figura correcta es la barra más larga formada al unir los extremos cortos.",
                    ),
                },
                explain=_tri(
                    "Joining the marked short ends in a straight line produces one longer bar.",
                    "Unir as extremidades curtas marcadas em linha reta produz uma barra mais longa.",
                    "Unir los extremos cortos marcados en línea recta produce una barra más larga.",
                ),
                concept=_tri("End matching", "Encaixe de extremidades", "Emparejamiento de extremos"),
                why_wrong=_tri(
                    "This figure stacks the bars, overlaps them, or leaves them apart.",
                    "Esta figura empilha as barras, sobrepõe-nas ou as deixa separadas.",
                    "Esta figura apila las barras, las superpone o las deja separadas.",
                ),
                rng=rng,
                question_type="SPATIAL",
                diagram_svg=_svg(stimulus, "Two separate bars with one marked end"),
                option_diagrams=[
                    _svg(joined, "Bars joined end to end"),
                    _svg(gap, "Bars separated by a gap"),
                    _svg(stack, "Bars stacked"),
                    _svg(overlap, "Bars overlapping"),
                ],
            )
        )
        index += 1
    return take_unique(rows, limit, seen)
