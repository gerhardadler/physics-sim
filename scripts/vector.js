export class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2D(0, 0);
    }
    return new Vector2D(this.x / mag, this.y / mag);
  }

  add(other) {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  subtract(other) {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  multiply(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  divide(scalar) {
    if (scalar === 0) {
      throw new Error("Cannot divide by zero");
    }
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  abs() {
    return new Vector2D(Math.abs(this.x), Math.abs(this.y));
  }

  radian() {
    return Math.atan2(this.y, this.x);
  }

  rotate(angle) {
    const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    return new Vector2D(x, y);
  }

  distance(other) {
    return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2);
  }

  static vectorFromRadian(radian) {
    return new Vector2D(Math.cos(radian), Math.sin(radian));
  }
}
