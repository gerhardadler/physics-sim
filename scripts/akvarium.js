import { Vector2D } from "./vector.js";

const app = new PIXI.Application({
  width: 1000,
  height: 1000,
});
document.body.appendChild(app.view);

function toScreenPosition(vec) {
  return new Vector2D(vec.x, 1000 - vec.y);
}

const gravity = new Vector2D(0, -1); // tweak strength

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
    this.position = this.position.subtract(new Vector2D(0, circleRadius));

    this.velocity = new Vector2D(30, 0);

    this.state = "STUCK"; // elsewise "FREE"

    this.app.stage.addChild(this.sprite);

    // let backgroundCircle = PIXI.sprite.
  }

  // The tick function updates the fish
  tick(delta) {
    // this.velocity = this.velocity.add(gravity.multiply(delta));

    switch (this.state) {
      case "STUCK":
        this.handleStuck(delta);
        break;
      case "FREE":
        this.handleFree(delta);
    }

    // 5. Update sprite
    let screenPosition = toScreenPosition(this.position);
    this.sprite.x = screenPosition.x - 40;
    this.sprite.y = screenPosition.y - 40;

    console.log("Energy " + this.calculateEnergy());
    console.log("State " + this.state);
  }

  handleStuck(delta) {
    let toCenter = this.position.subtract(circleCenter);
    let normal = toCenter.normalize();
    let tangent = normal.rotate(Math.PI / 2);
    let radialSpeed = this.velocity.dot(tangent);

    let minSpeed = Math.sqrt(circleRadius * Math.max(0, normal.y * -gravity.y));

    if (Math.abs(radialSpeed) >= minSpeed) {
      let rotateAmount = (radialSpeed / circleRadius) * delta;
      let originalAngle = normal.radian();
      let newAngle = originalAngle + rotateAmount;
      let rotateVector = Vector2D.vectorFromRadian(newAngle);
      let newPosition = circleCenter.add(rotateVector.multiply(circleRadius));

      // Energy conservation: KE + PE = const
      // 0.5*v² + g*y = 0.5*v0² + g*y0
      let dy = newPosition.y - this.position.y;
      let speedSq = this.velocity.magnitudeSquared() + 2 * gravity.y * dy;
      // (gravity.y is negative, dy positive when going up → speed decreases)
      let newSpeed = Math.sqrt(Math.max(0, speedSq));

      this.position = newPosition;
      let newTangent = rotateVector.rotate(Math.PI / 2);
      this.velocity = newTangent.multiply(Math.sign(radialSpeed) * newSpeed);
    } else {
      this.state = "FREE";
      this.handleFree(delta);
    }
  }

  detectCollision(delta) {
    let movement = this.velocity.multiply(delta);

    let toCenter = this.position.subtract(circleCenter);

    let newPosition = this.position.add(movement);
    let toCenterNew = newPosition.subtract(circleCenter);

    // check if already colliding
    if (toCenter.magnitude() >= circleRadius + 1) {
      console.log("EMERGENCY SNAP", toCenter.magnitude() - circleRadius);
      return 0;
    }

    // Check if collision with some margin
    if (toCenterNew.magnitude() <= circleRadius + 1) {
      return null;
    }

    let a = movement.magnitudeSquared();
    let b = 2 * toCenter.dot(movement);
    let c = toCenter.magnitudeSquared() - circleRadius ** 2;
    let discriminant = b ** 2 - 4 * a * c;
    if (discriminant >= 0) {
      console.log("Collision detected");
      let sqrtDisc = Math.sqrt(discriminant);
      let t1 = (-b - sqrtDisc) / (2 * a);
      let t2 = (-b + sqrtDisc) / (2 * a);

      console.log(t1, t2);

      let aboveZero = [t1, t2].filter((t) => t >= 0);
      if (aboveZero.length === 0) {
        return null;
      }
      let collisionTime = Math.min(...aboveZero);
      console.log(collisionTime, delta);
      if (collisionTime > delta) {
        return null;
      }
      return collisionTime;
    }
    return null;
  }

  handleFree(delta) {
    let originalVelocity = this.velocity;
    this.velocity = this.velocity.add(gravity.multiply(delta / 2));

    let collisionTime = this.detectCollision(delta);
    if (collisionTime !== null) {
      this.velocity = originalVelocity;
      this.velocity = this.velocity.add(gravity.multiply(collisionTime / 2));
      // Finish the first half-step up to collision time only
      this.position = this.position.add(this.velocity.multiply(collisionTime));
      // Apply the gravity owed for the first segment before handing off
      this.velocity = this.velocity.add(gravity.multiply(collisionTime / 2));
      this.handleCollision(delta - collisionTime);
      return; // don't apply the trailing half-step
    }

    this.position = this.position.add(this.velocity.multiply(delta));
    this.velocity = this.velocity.add(gravity.multiply(delta / 2));
  }

  handleCollision(remainingDelta) {
    let toCenter = this.position.subtract(circleCenter);
    let normal = toCenter.normalize();

    // Reflect velocity
    let normalSpeed = normal.multiply(this.velocity.dot(normal));
    let tangentVel = this.velocity.subtract(normalSpeed);
    this.velocity = tangentVel.subtract(normalSpeed);

    // Check if it should stick
    let minSpeed = Math.sqrt(circleRadius * Math.max(0, normal.y * -gravity.y));
    if (tangentVel.magnitude() >= minSpeed) {
      this.state = "STUCK";
      if (remainingDelta) {
        this.handleStuck(remainingDelta);
      }
    } else {
      this.state = "FREE";
      // Use remaining time to keep moving after bounce
      if (remainingDelta) {
        this.handleFree(remainingDelta);
      }
    }
  }

  calculateEnergy() {
    let kinetic = 0.5 * this.velocity.magnitude() ** 2;
    let potential = -gravity.y * this.position.y;
    return kinetic + potential;
  }
}

// Creates an array of fishes, and gives them random positions and colors
const fish = new Fish(app, "images/pelle_nerd.png");
let elapsed = 0.0;

app.ticker.add((delta) => {
  elapsed += delta;
  fish.tick(delta);
});

// document.addEventListener("keydown", function (event) {
//   if (event.code === "KeyT") {
//     fish.tick(1);
//   }
// });
