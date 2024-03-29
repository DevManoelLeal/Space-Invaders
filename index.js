const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        };

        this.rotation = 0

        const image = new Image()
        image.src = './images/spaceship.png'
        image.onload = () => {
            const scale = 0.15
            this.image = image 
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        };
    };

    draw() {

        c.save()
        c.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        )
        c.rotate(this.rotation)

        c.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        )

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
            )
        c.restore()
    };

    update() {
        if (this.image) {
            this.draw()
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        };
    };
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = 5
    };

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = '#f24018'
        c.fill()
        c.closePath()
    };

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    };
};

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;

        this.width = 4
        this.height = 10
    };

    draw() {
        c.fillStyle = 'white'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

    };

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    };
};

class Invader {
    constructor({position}) {
        this.velocity = {
            x: 0,
            y: 0
        };

        const image = new Image()
        image.src = './images/invader.png'
        image.onload = () => {
            const scale = 0.09
            this.image = image 
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        };
    };

    draw() {

        c.save()
        c.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        )

        c.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        )

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
            )
        c.restore()
    };

    update({velocity}) {
        if (this.image) {
            this.draw()
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        };
    };

    shoot(invaderProjectiles){
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }))
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 4,
            y: 0
        }

        this.invaders = []

        const columns = Math.floor(Math.random() * 9 + 5)
        const rows = Math.floor(Math.random() * 5 + 1)

        this.width = columns * 35

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++){
                this.invaders.push(
                    new Invader({
                        position: {
                        x: x * 35,
                        y: y * 35
                        }
                    })
                )
            }
        }
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 30 
        }
    }
}

const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    },
    w: {
        pressed: false
    },
    s: {
        pressed: false
    }

};

let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)

    if (!keys.a.pressed && !keys.d.pressed) {
        player.rotation = 0;
    }

    player.update()
    invaderProjectiles.forEach((InvaderProjectile, index) => {
        if (InvaderProjectile.position.y + InvaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            }, 0)
        } else {
            InvaderProjectile.update()
        }
    })
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        } else {
            projectile.update()
        }
    })

    grids.forEach((grid, gridIndex) => {
        grid.update()
        if (frames % 100 === 0 && grid.invaders.length > 0){
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity})

            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= 
                    invader.position.y + invader.height && 
                    projectile.position.x + projectile.radius >= 
                    invader.position.x && 
                    projectile.position.x - projectile.radius <= 
                    invader.position.x + invader.width && projectile.position.y + projectile.radius >= 
                    invader.position.y) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find((invader2) => invader2 === invader
                        )
                        const projectileFound = projectiles.find(projectile2 => projectile2 === projectile)

                        if (invaderFound && projectileFound) {
                        grid.invaders.splice(i, 1)
                        projectiles.splice(j , 1)

                        if (grid.invaders.length > 0) {
                            const firstInvader = grid.invaders[0]
                            const lastInvader = grid.invaders[grid.invaders.length - 1]

                            grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                            grid.position.x = firstInvader.position.x 
                        } else {
                            grids.splice(gridIndex, 1)
                        }
                        }
                    }, 0)
                }
            })
        })
    })

    player.velocity.x = 0;
    if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x += -7;
    } 
    if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
    player.velocity.x += 7;
    }

    player.rotation.x = 0;
    if (keys.a.pressed) {
    player.rotation = -0.15;
    }
    if (keys.d.pressed) {
    player.rotation = 0.15;
    }

    player.velocity.y = 0;
    if (keys.w.pressed && player.position.y >= 300) {
    player.velocity.y += -8;
    } 
    if (keys.s.pressed && player.position.y + player.height <= canvas.height) {
    player.velocity.y += 8;
    }

    if (frames % randomInterval === 0) {
        grids.push(new Grid())
        randomInterval = Math.floor(Math.random() * 500 + 500)
        frames = 0
    }

    frames++
};

animate()

var isKeyDown = false;

window.addEventListener('keydown', function(space) {
    if (!isKeyDown) {
      isKeyDown = true;
    } else {
      return
    }
    switch (space.key) {
        case ' ':
            //console.log('space')
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -9
                }
            }))
            break
    }
});

window.addEventListener('keyup', function(space) {
  isKeyDown = false;
});

addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'a':
            //console.log('left')
            keys.a.pressed = true
            break
        case 'd':
            //console.log('right')
            keys.d.pressed = true
            break
        case 'w':
            //console.log('up')
            keys.w.pressed = true
            break
        case 's':
            //console.log('down')
            keys.s.pressed = true
            break
    }
});

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'a':
           // console.log('left')
            keys.a.pressed = false
            break
        case 'd':
            //console.log('right')
            keys.d.pressed = false
            break
        case 'w':
            //console.log('up')
            keys.w.pressed = false
            break
        case 's':
           // console.log('down')
            keys.s.pressed = false
            break
    }
});