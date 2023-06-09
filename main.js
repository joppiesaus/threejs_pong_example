import * as THREE from 'three';

// TODO: less hardcoded values

const PADDLE_WIDTH = 0.2;
const PADDLE_HEIGHT = 3;
const BORDER_GEOMETRY = new THREE.BoxGeometry( 9.25, 0.15, 1.5 );
const BORDER_POSITION_Y = 3.25;
const BALL_SIZE = 0.2;

const PADDLE_POSITION_X = 5;

const INITIAL_BALL_DIRECTION = (new THREE.Vector3( 2, 1.1, 0 )).normalize();
const INITIAL_BALL_VELOCITY = 2.5;

let clock;
let scene, camera, renderer;

let paddleMaterial;

let paddles = [];
let collision_objects = [];

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

    createBorder( -BORDER_POSITION_Y );
    createBorder(  BORDER_POSITION_Y );

    createBall();


    window.addEventListener( 'resize', onWindowResize );
    window.addEventListener( 'mousemove', onMouseMove );

}

function createPaddle( x ) {

    let geometry = new THREE.BoxGeometry( PADDLE_WIDTH, PADDLE_HEIGHT, 1.5 );

    let paddle = new THREE.Mesh( geometry, paddleMaterial );
    paddle.position.set( x, 0, 0 );
    paddle.userData.normal = new THREE.Vector3( 0, 0, 0 );
    paddle.userData.normal.x = x > 0 ? -1 : 1;

    scene.add( paddle );
    paddles.push( paddle );
    collision_objects.push( paddle );

    return paddle;

}

function createBorder( y )
{

    let border = new THREE.Mesh( BORDER_GEOMETRY, paddleMaterial );
    border.position.set( 0, y, 0 );
    border.userData.normal = new THREE.Vector3( 0, 0, 0 );
    border.userData.normal.y = y > 0 ? -1 : 1;

    scene.add( border );
    collision_objects.push( border );

    return border;

}

function createBall() {

    const ballMaterial = new THREE.MeshPhongMaterial( { color: 0xedc25c, shininess: 30, specular: 0x211133 });
    const ballGeometry = new THREE.SphereGeometry( 0.2 );

    ball = {
        direction: (new THREE.Vector3()).copy( INITIAL_BALL_DIRECTION ), // if you'd just do INITIAL_BALL_DIRECTION, you'd change that value
        mesh: new THREE.Mesh( ballGeometry, ballMaterial ),

        update: function( delta ) {

            for ( let i = 0; i < collision_objects.length; i++ ) {

                const obj = collision_objects[ i ];

                // WARNING: this will not change when you change the geometry!
                // TODO: more accurate collision by calculating distance from surface to ball, right now it's sqauare
                // - square, not square - sphere
                const widthOffset = obj.geometry.parameters.width / 2 + BALL_SIZE / 2;
                const heightOffset = obj.geometry.parameters.height / 2 + BALL_SIZE / 2;

                if ( this.mesh.position.x < obj.position.x + widthOffset &&
                     this.mesh.position.x > obj.position.x - widthOffset &&
                     this.mesh.position.y < obj.position.y + heightOffset &&
                     this.mesh.position.y > obj.position.y - heightOffset) {

                    // TODO: when there's lag, the ball can "get stuck" inside
                    // Fix this by setting the offset

                    // we've made a collision, reflect(thanks MiniRT)

                    const normal = obj.userData.normal;

                    // out = ray in - 2 * (cos angle) * normal
                    // out = ray in - 2 * (normal . ray in) * normal
                    let normalTemp = (new THREE.Vector3()).copy( normal );
                    this.direction.sub( normalTemp.multiplyScalar( 2.0 * normal.dot( this.direction ) ) );

                    // assume only one collision at the time, so we can stop
                    break;

                }

            }

            // ball out of screen, reset
            if ( Math.abs( this.mesh.position.x ) > 6 ) {

                this.direction.copy( INITIAL_BALL_DIRECTION );
                this.mesh.position.set( 0, 0, 0 );

            }

            const step = this.direction.clone().multiplyScalar( delta ).multiplyScalar( INITIAL_BALL_VELOCITY );

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
    const canvasHeight = Math.floor( window.innerWidth * 9 / 16 );

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

