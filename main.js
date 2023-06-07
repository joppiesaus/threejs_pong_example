import * as THREE from 'three';

// TODO: less hardcoded values

const PADDLE_WIDTH = 0.2;
const PADDLE_HEIGHT = 3;
const BALL_SIZE = 0.2;

const PADDLE_POSITION_X = 5;

const INITIAL_BALL_VELOCITY = new THREE.Vector3( -2, 0.5, 0 );

let clock;
let scene, camera, renderer;

let paddleMaterial;

let paddles = [];

let ball;

init();
animate();

function init() {

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / Math.floor( window.innerWidth * 9 / 16 ), 0.1, 1000 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, Math.floor( window.innerWidth * 9 / 16 ) );
    document.body.appendChild( renderer.domElement );

    camera.position.z = 5;

    paddleMaterial = new THREE.MeshNormalMaterial( { color: 0x888888 } );

    const light = new THREE.AmbientLight( 0xfffffff, 1.0 );
    scene.add( light );


    createPaddle( -PADDLE_POSITION_X );
    createPaddle(  PADDLE_POSITION_X );

    createBall();


    window.addEventListener( 'resize', onWindowResize );
    window.addEventListener( 'mousemove', onMouseMove );

}

function createPaddle( x ) {

    let geometry = new THREE.BoxGeometry( PADDLE_WIDTH, PADDLE_HEIGHT, 1.5 );

    let paddle = new THREE.Mesh( geometry, paddleMaterial );
    paddle.position.set( x, 0, 0 );

    scene.add( paddle );
    paddles.push( paddle );

    return paddle;

}

function createBall() {

    const ballMaterial = new THREE.MeshPhongMaterial( { color: 0xedc25c, shininess: 30, specular: 0x211133 });
    const ballGeometry = new THREE.SphereGeometry( 0.2 );

    ball = {
        velocity: (new THREE.Vector3()).copy( INITIAL_BALL_VELOCITY ), // if you'd just do INITIAL_BALL_VELOCITY, you'd change that value
        mesh: new THREE.Mesh( ballGeometry, ballMaterial ),

        update: function( delta ) {

            const paddle = paddles[ this.velocity.x < 0 ? 0 : 1 ];
            const widthOffset = PADDLE_WIDTH / 2 + BALL_SIZE / 2;
            const heightOffset = PADDLE_HEIGHT / 2;

            if ( this.mesh.position.y < paddle.position.y + heightOffset &&
                 this.mesh.position.y > paddle.position.y - heightOffset )
            {

                // TODO: on weird lag spike, ball might be forever "inside" the paddle, never escaping it.
                if ( this.mesh.position.x < paddle.position.x + widthOffset && 
                    this.mesh.position.x > paddle.position.x - widthOffset ) {

                    this.velocity.multiplyScalar( -1.0 );
                    // TODO: make ball reflect

                }
            }

            // ball out of screen, reset
            if ( Math.abs( this.mesh.position.x ) > 6 ) {

                this.velocity.copy( INITIAL_BALL_VELOCITY );
                this.mesh.position.set( 0, 0, 0 );

            }

            // TODO: make sure ball can bounce on sides of the screen.

            const step = this.velocity.clone().multiplyScalar( delta );

            this.mesh.position.add( step );

            paddles[ 1 ].position.y = this.mesh.position.y;

        },
    }

    scene.add( ball.mesh );

}


function animate() {

    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    ball.update( delta );

    render();

}

function render() {

    renderer.render( scene, camera );

}

function onWindowResize() {

    const canvasWidth = window.innerWidth;
    const canvasHeight =Math.floor( window.innerWidth * 9 / 16 );

    renderer.setSize( canvasWidth, canvasHeight );

    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();

    render();

}

function onMouseMove( event ) {

    event.preventDefault();

    const mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    const mouseY = ( event.clientY / window.innerHeight ) * 2 - 1;

    paddles[ 0 ].position.y = -mouseY * 3;

}

