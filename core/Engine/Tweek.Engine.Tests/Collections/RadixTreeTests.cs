using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace Tweek.Engine.Collections.Tests
{
    public class RadixTreeTests
    {
        [Fact]
        public void Insert_ExistingKey_Replaces()
        {
            //Arrange
            var expectedTree = new Dictionary<string, int>
            {
                [""] = 2,
                ["a"] = 1,
            };
            var radixTree = InitTree(expectedTree.Keys, 1);

            //Act
            var (oldValue, updated) = radixTree.Insert("", 2);

            //Assert
            Assert.True(updated, "key should be updated");
            Assert.Equal(1, oldValue);
            Assert.Equal(expectedTree.Count, radixTree.Count);
            Assert.Equal(expectedTree.Keys, radixTree.Keys);
            Assert.Equal(expectedTree, radixTree.ToDictionary());
        }

        [Theory]
        [InlineData(1)]
        [InlineData(100)]
        [InlineData(10000)]
        public void Insert_NotExistingKey_Adds(int count)
        {
            //Arrange
            var expectedTree = Enumerable.Range(0, count).ToDictionary(_ => Guid.NewGuid().ToString(), x => x);
            var radixTree = new RadixTree<int>();

            foreach (var item in expectedTree)
            {
                // Act
                var (_, updated) = radixTree.Insert(item.Key, item.Value);

                // Assert
                Assert.False(updated);
            }

            Assert.Equal(expectedTree.Count, radixTree.Count);
            Assert.Equal(expectedTree.Keys, radixTree.Keys);
            Assert.Equal(expectedTree, radixTree.ToDictionary());
        }

        [Theory]
        [InlineData("")]
        [InlineData("A")]
        [InlineData("AB")]
        public void Delete_ExistingKey_Deleted(string keyToDelete)
        {
            // Arrange
            var keys = new[] { "", "A", "AB" };
            var radixTree = InitTree(keys, 1);

            // Act
            var (val, ok) = radixTree.Delete(keyToDelete);

            // Assert
            Assert.True(ok, "Key should be removed");
            Assert.Equal(1, val);
            Assert.Equal(keys.Length - 1, radixTree.Count);
            Assert.Equal(keys.Where(x => x != keyToDelete), radixTree.Keys.OrderBy(x => x));
        }

        [Theory]
        [InlineData("C")]
        [InlineData("AC")]
        [InlineData("ABC")]
        public void Delete_NotExistingKey_NoChange(string keyToDelete)
        {
            // Arrange
            var keys = new[] { "", "A", "AB" };
            var radixTree = InitTree(keys, 1);

            // Act
            var (_, ok) = radixTree.Delete(keyToDelete);

            // Assert
            Assert.False(ok, "Key should not be removed");
            Assert.Equal(keys.Length, radixTree.Count);
            Assert.Equal(keys, radixTree.Keys.OrderBy(x => x));
        }

        [Theory]
        [InlineData("")]
        [InlineData("A")]
        public void Delete_EmptyTree_NoChange(string keyToDelete)
        {
            // Arrange
            var radixTree = new RadixTree<int>();

            // Act
            var (_, ok) = radixTree.Delete(keyToDelete);

            // Assert
            Assert.False(ok, "Key should not be removed");
            Assert.Equal(0, radixTree.Count);
        }

        [Theory]
        [InlineData("")]
        [InlineData("foo")]
        public void TryGetValue_ExistingKey_ReturnsValue(string input)
        {
            // Arrange
            var rand = new Random();
            var keys = new[] {
                "",
                "foo",
            };
            var dictionary = keys.ToDictionary(x => x, _ => rand.Next());
            var radixTree = new RadixTree<int>(dictionary);

            // Act
            var found = radixTree.TryGetValue(input, out int value);

            // Assert
            Assert.True(found, "should find value");
            Assert.Equal(dictionary[input], value);
        }

        [Theory]
        [InlineData("fo")]
        [InlineData("b")]
        [InlineData("foobar")]
        [InlineData("barfoo")]
        public void TryGetValue_NotExistingKey_NotFound(string input)
        {
            // Arrange
            var radixTree = InitTree(new[] { "foo", "bar" }, 1);

            // Act
            var found = radixTree.TryGetValue(input, out int _);

            // Assert
            Assert.False(found, "should not find value");
        }

        [Theory]
        [InlineData("")]
        [InlineData("a")]
        public void TryGetValue_EmptyTree_NotFound(string input)
        {
            // Arrange
            var radixTree = new RadixTree<int>();

            // Act
            var found = radixTree.TryGetValue(input, out int _);

            // Assert
            Assert.False(found, "should not find value");
        }

        [Theory]
        [InlineData("a", "")]
        [InlineData("abc", "")]
        [InlineData("fo", "")]
        [InlineData("foo", "foo")]
        [InlineData("foob", "foo")]
        [InlineData("foobar", "foobar")]
        [InlineData("foobarba", "foobar")]
        [InlineData("foobarbaz", "foobarbaz")]
        [InlineData("foobarbazzi", "foobarbaz")]
        [InlineData("foobarbazzip", "foobarbazzip")]
        [InlineData("foozi", "foo")]
        [InlineData("foozip", "foozip")]
        [InlineData("foozipzap", "foozip")]
        public void LongestPrefix_ExistingPrefix_ReturnsValue(string input, string expected)
        {
            // Arrange
            var rand = new Random();
            var keys = new[] {
                "",
                "foo",
                "foobar",
                "foobarbaz",
                "foobarbazzip",
                "foozip",
            };
            var dictionary = keys.ToDictionary(x => x, _ => rand.Next());
            var radixTree = new RadixTree<int>(dictionary);

            // Act
            var (key, value, found) = radixTree.LongestPrefix(input);

            // Assert
            Assert.True(found, "should find longest prefix match");
            Assert.Equal(expected, key);
            Assert.Equal(dictionary[expected], value);
        }

        [Theory]
        [InlineData("a")]
        [InlineData("abc")]
        [InlineData("fo")]
        [InlineData("oo")]
        [InlineData("bar")]
        public void LongestPrefix_NonExistingPrefix_NotFound(string input)
        {
            // Arrange
            var keys = new[]
            {
                "foo",
                "foobar",
                "foobarbaz",
                "foobarbazzip",
                "foozip"
            };
            var radixTree = InitTree(keys, 1);

            // Act
            var (_, _, found) = radixTree.LongestPrefix(input);

            // Assert
            Assert.False(found, "should not find longest prefix match");

        }

        [Theory]
        [InlineData("")]
        [InlineData("a")]
        public void LongestPrefix_EmptyTree_NotFound(string input)
        {
            // Arrange
            var radixTree = new RadixTree<int>();

            // Act
            var (_, _, found) = radixTree.LongestPrefix(input);

            // Assert
            Assert.False(found, "should not find longest prefix match");
        }

        [Theory]
        [InlineData("f", new[] { "foobar", "foo/bar/baz", "foo/baz/bar", "foo/zip/zap" })]
        [InlineData("foo", new[] { "foobar", "foo/bar/baz", "foo/baz/bar", "foo/zip/zap" })]
        [InlineData("foob", new[] { "foobar" })]
        [InlineData("foo/", new[] { "foo/bar/baz", "foo/baz/bar", "foo/zip/zap" })]
        [InlineData("foo/b", new[] { "foo/bar/baz", "foo/baz/bar" })]
        [InlineData("foo/ba", new[] { "foo/bar/baz", "foo/baz/bar" })]
        [InlineData("foo/bar", new[] { "foo/bar/baz" })]
        [InlineData("foo/bar/baz", new[] { "foo/bar/baz" })]
        [InlineData("foo/bar/bazoo", new string[] { })]
        [InlineData("z", new[] { "zipzap" })]
        public void ListPrefix(string input, string[] expected)
        {
            // Arrange
            var keys = new[]
            {
                "foobar",
                "foo/bar/baz",
                "foo/zip/zap",
                "zipzap",
                "foo/baz/bar"
            };
            var r = InitTree(keys, 1);

            // Act
            var result = r.ListPrefix(input);

            // Assert
            Assert.Equal(expected.Select(x => (x, 1)).OrderBy(x => x).ToList(), result);
        }

        private static RadixTree<T> InitTree<T>(IEnumerable<string> keys, T initialValue) => new RadixTree<T>(keys.ToDictionary(x => x, _ => initialValue));
    }
}