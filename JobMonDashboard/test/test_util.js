describe("test utility functions", function () {
    //beforeEach(function () {
    //    console.log("beofre");
    //});
    describe("utility to pull data from an object array that has array properties", function () {
        it("should flatten object to array", function () {
            expect(JMUtil).not.toBeNull();//make sure the object got imported

            var testData = [
                { testProperty: ["Thing1", "Thing2"] },
                { testProperty: ["Thing3"] },
                { notTestProperty: ["dummy"]}
            ];

            var flattened = JMUtil.flattenNode(testData, 'testProperty');
            expect(flattened).not.toBeNull();
            expect(flattened.length).toBe(3);
        })

        it("should work for nulls", function () {
            var flattened = JMUtil.flattenNode(null, 'testProperty');
            expect(flattened).not.toBeNull();
            expect(flattened.length).toBe(0);
        });

        it("should work for empty array", function () {
            var flattened = JMUtil.flattenNode([], 'testProperty');
            expect(flattened).not.toBeNull();
            expect(flattened.length).toBe(0);
        });

        it("should NOT work for string", function () {
            var flattened = JMUtil.flattenNode('test string', 'testProperty');
            expect(flattened).not.toBeNull();
            expect(flattened.length).toBe(0);
        });

        it("should NOT work for object", function () {
            var flattened = JMUtil.flattenNode({}, 'testProperty');
            expect(flattened).not.toBeNull();
            expect(flattened.length).toBe(0);
        });

    });

    describe("Tests for counting unique instances in array", function UniqueItemsTest() {
        it("should count numbers", function countNumbers() {
            var bob = JMUtil.countUnique([1, 2, 2]);
            expect(bob).not.toBeNull();
            var hasCorrectProperty = bob.hasOwnProperty(2);
            expect(hasCorrectProperty).toBe(true);
            expect(bob['2']).toBe(2);
        });

        it("should count strings", function countNumbers() {
            var bob = JMUtil.countUnique(["one", "two", "two"]);
            expect(bob).not.toBeNull();
            var hasCorrectProperty = bob.hasOwnProperty("two");
            expect(hasCorrectProperty).toBe(true);
            expect(bob.two).toBe(2);
        });
    });
})