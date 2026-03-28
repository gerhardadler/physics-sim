import { Vector2D } from "./vector.js";

const app = new PIXI.Application({
  width: 1000,
  height: 1000,
});
document.body.appendChild(app.view);

function generateRandomPos(app, sprite_bounds) {
  return new Vector2D(
    Math.floor(Math.random() * (app.renderer.width - sprite_bounds.width)),
    Math.floor(Math.random() * (app.renderer.height - sprite_bounds.height)),
  );
}

const gravity = new Vector2D(0, 1); // tweak strength

let circleCenter = new Vector2D(500, 500);
let circleRadius = 300;

// Create a Graphics object, set a fill color, draw a rectangle
let obj = new PIXI.Graphics();
obj.beginFill(0x999999);
obj.drawCircle(500, 500, 300 + 40);

// Add it to the stage to render
app.stage.addChild(obj);

class Fish {
  constructor(app, image) {
    this.app = app;
    this.sprite = PIXI.Sprite.from(image);
    this.sprite.width = 80;
    this.sprite.height = 80;
    this.position = circleCenter;
    this.position = this.position.add(new Vector2D(0, circleRadius));

    this.velocity = new Vector2D(35, 0);
    this.acceleration = new Vector2D(0, 0);

    this.gravity = new Vector2D(0, 0.1);

    this.app.stage.addChild(this.sprite);

    // let backgroundCircle = PIXI.sprite.
  }

  // The tick function updates the fish
  tick(delta) {
    // // 1. Apply gravity
    // this.velocity = this.velocity.add(gravity.multiply(delta));

    // // 2. Move freely

    // // 3. Check relation to circle
    // let toCenter = this.position.subtract(circleCenter);
    // let dist = toCenter.magnitude();
    // let normal = toCenter.normalize();

    // // 4. Check if near the loop
    // let distanceFromCircle = Math.abs(dist - circleRadius);

    // if (distanceFromCircle < 5) {
    //   console.log("es");
    //   // Tangent direction
    //   let tangent = normal.rotate(-Math.PI / 2);

    //   // Current speed along tangent
    //   let tangentSpeed = this.velocity.dot(tangent);

    //   // --- Loop condition ---
    //   // Require enough speed to stay attached
    //   let gravityStrength = gravity.y;
    //   let verticalFactor = normal.y; // top = -1, bottom = 1

    //   let minSpeed = Math.sqrt(
    //     gravityStrength * circleRadius * Math.max(0, -verticalFactor),
    //   );

    //   if (Math.abs(tangentSpeed) > minSpeed) {
    //     console.log("hmm");
    //     // Stick to loop

    //     // Keep only tangent motion
    //     console.log(tangent.x, tangent.y, tangentSpeed);
    //     let radialSpeed = this.velocity.dot(normal);

    //     // Only correct if moving outward
    //     if (radialSpeed > 0) {
    //       this.velocity = this.velocity.subtract(normal.multiply(radialSpeed));
    //     }

    //     // Snap to circle
    //     let correction = normal.multiply(circleRadius - dist);
    //     this.position = this.position.add(correction);
    //   }
    //   // else: too slow → fall (do nothing)
    // }

    // this.position = this.position.add(this.velocity.multiply(delta));

    this.velocity = this.velocity.subtract(gravity.multiply(delta));

    let toCenter = this.position.subtract(circleCenter);
    let centerDist = toCenter.magnitude();
    let circleDist = Math.abs(centerDist - circleRadius);
    let normal = toCenter.normalize();
    let tangent = normal.rotate(-Math.PI / 2);

    // radialSpeed is how much of the speed is following the circle

    let radialSpeed = this.velocity.dot(tangent);

    console.log(centerDist);
    let minSpeed = Math.sqrt(gravity.y * circleRadius * Math.max(0, -normal.y));
    if (radialSpeed >= minSpeed && circleDist < 20) {
      let rotateAmount = (radialSpeed / circleRadius) * delta;

      let originalAngle = normal.radian();

      let newAngle = originalAngle + rotateAmount;

      let rotateVector = Vector2D.vectorFromRadian(newAngle);

      this.position = circleCenter.add(rotateVector.multiply(circleRadius));
      this.velocity = this.velocity.rotate(rotateAmount);
    } else {
      this.position = this.position.subtract(this.velocity.multiply(delta));
    }

    // 5. Update sprite
    this.sprite.x = this.position.x - 40;
    this.sprite.y = this.position.y - 40;

    // console.log(this.velocity);
    // console.log(this.velocity.magnitude());
    // console.log(acceleration);
  }
}

// Creates an array of fishes, and gives them random positions and colors
const fish = new Fish(app, "images/pelle_nerd.png");
let elapsed = 0.0;

// app.ticker.add((delta) => {
//   elapsed += delta;
//   fish.tick(delta);
// });

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    fish.tick(1);
  }
});
