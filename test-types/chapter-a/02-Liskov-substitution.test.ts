


//Shape
// Parent contract
class Shape {
    getArea(): number {
        return 0;
    }
}

// Valid subtype - fulfills contract
class Circle extends Shape {
    constructor(readonly radius: number) {
        super();
    }

    getArea(): number {
        return Math.PI * this.radius * this.radius;
    }
}

// Valid subtype - fulfills contract
class Rectangle extends Shape {
    constructor(readonly width: number, readonly height: number) {
        super();
    }

    getArea(): number {
        return this.width * this.height;
    }
}

class Line extends Shape {
    constructor(readonly width: number) {
        super();
    }
    getArea(): number {
        throw new Error("Line has no area")
    }
}


describe('Chapter A Section 02: Liskov Substitution Principle (LSP)', () => {

        it('should respect the Liskov Principle', () => {

            const shapes: Shape[] = [
                new Circle(5),
                new Rectangle(10, 20)
            ]

            let allAreas = shapes.map( x => x. getArea() )

            expect(  allAreas.pop()).toBe(200)
            expect(  allAreas.pop()).toBeCloseTo(78.5 , 1e-1 )
        })

    it('breaks  the Liskov', () => {

        const shapes: Shape[] = [
            new Circle(5),
            new Rectangle(10, 20),
            new Line(5)
        ]

        let allAreas = shapes.map( x => x. getArea() )

        expect( allAreas.pop()).toBe(0) // that won't even occur 🤔

    })
})
