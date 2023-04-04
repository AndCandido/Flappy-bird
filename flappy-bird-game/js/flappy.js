function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = (x) => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const flappy = document.querySelector('[wm-flappy]')
// const b = new ParDeBarreiras(flappy.clientHeight, 200, 400)
// flappy.appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const frames = 3

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - frames)

            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + frames >= meio 
                && par.getX() < meio
            
            if(cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = (y) => this.elemento.style.bottom = `${y}px`
    
    window.onkeydown = () => voando = true
    window.onkeyup = () => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 7 : -4)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0) {
            this.setY(0)
        } else if(novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = (ponto) => {
        this.elemento.innerHTML = ponto
    }
    this.atualizarPontos(0)
}

function estaoSobrepontos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const dimencoesA = {
        ladoDireito: a.left + a.width,
        ladoInferior: a.top + a.height
    }
    const dimencoesB = {
        ladoDireito: b.left + b.width,
        ladoInferior: b.top + b.height
    }
 
    const horizontal = dimencoesA.ladoDireito >= b.left
        && dimencoesB.ladoDireito >= a.left
        
    const vertical = dimencoesA.ladoInferior >= b.top
        && dimencoesB.ladoInferior >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(par => {
        if(!colidiu) {
            const superior = par.superior.elemento
            const inferior = par.inferior.elemento
            colidiu = estaoSobrepontos(passaro.elemento, superior)
                || estaoSobrepontos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function resetGame(areaDoJogo, temporizador) {
    alert('Você perdeu')
    areaDoJogo.innerHTML = ''
    clearInterval(temporizador)
    new FlappyBird().start()
}

function FlappyBird() {
    let ponto = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++ponto))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)) {
                resetGame(areaDoJogo, temporizador)
            }
        }, 20)
    }
    estaoSobrepontos(passaro.elemento, barreiras.pares[0].elemento)
}

new FlappyBird().start()