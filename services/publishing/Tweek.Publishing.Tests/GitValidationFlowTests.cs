using System;
using Tweek.Publishing.Service.Validation;
using Xunit;
using FakeItEasy;
using static LanguageExt.Prelude;
using static FakeItEasy.Repeated;
using System.Threading.Tasks;

namespace Tweek.Publishing.Tests
{
    public class GitValidationFlowTests
    {
        [Fact]
        public async Task PatternsAreInvokedCorrectly()
        {
            var flow = new GitValidationFlow();
            var fakeValidator = A.Fake<IValidator>();
            flow.Validators.Add(("manifests/.*",fakeValidator));

            await flow.Validate("a", "b", async (s)=> {
                switch (s){
                    case var o when o.Contains("diff"):
                        return String.Join("\n",
                        "M\tmanifests/path/to/key.json",
                        "M\tmanifes/path/to/key.json",
                        "M\timplementations/jpad/path/to/key.json");
                    default:
                        return "data";
                }
            });

            A.CallTo(()=> fakeValidator.Validate(null,null)).WithAnyArguments().MustHaveHappened(Exactly.Once);
            A.CallTo(()=> fakeValidator.Validate("manifests/path/to/key.json", 
            A<Func<string,Task<string>>>.Ignored)).MustHaveHappened();
        }

        [Fact]
        public async Task ShouldFilterDeletedFiles()
        {
            var flow = new GitValidationFlow();
            var fakeValidator = A.Fake<IValidator>();
            flow.Validators.Add(("manifests/.*",fakeValidator));

            await flow.Validate("a", "b", async (s)=> {
                switch (s){
                    case var o when o.Contains("diff"):
                        return String.Join("\n",
                        "A\tmanifests/path/to/add.json",
                        "M\tmanifests/path/to/modify.json",
                        "D\tmanifests/path/to/delete.json");
                    default:
                        return "data";
                }
            });

            A.CallTo(()=> fakeValidator.Validate(null,null)).WithAnyArguments().MustHaveHappened(Exactly.Twice);
            A.CallTo(()=> fakeValidator.Validate("manifests/path/to/add.json", 
            A<Func<string,Task<string>>>.Ignored)).MustHaveHappened();
            A.CallTo(()=> fakeValidator.Validate("manifests/path/to/modify.json", 
            A<Func<string,Task<string>>>.Ignored)).MustHaveHappened();
        }

        [Fact]
        public async Task ShouldWorkProperlyWithMultiplePatterns()
        {
            var flow = new GitValidationFlow();
            var manifestValidator = A.Fake<IValidator>();
            var jpadValidator = A.Fake<IValidator>();
            flow.Validators.Add((Patterns.Manifests,manifestValidator));
            flow.Validators.Add((Patterns.JPad,jpadValidator));

            await flow.Validate("a", "b", async (s)=> {
                switch (s){
                    case var o when o.Contains("diff"):
                        return String.Join("\n",
                        "M\tmanifests/path/to/key.json", 
                        "M\tmanifests/path/to/key.manifest",
                        "M\tmanifes/path/to/key.json",
                        "M\timplementations/jpad/path/to/key.jpad",
                        "M\timplementations/abc/path/to/key.jpad",
                        "M\timplementations/jpad/path/to/key.json");
                    default:
                        return "data";
                }
            });

            A.CallTo(()=> manifestValidator.Validate(null,null)).WithAnyArguments().MustHaveHappened(Exactly.Once);
            A.CallTo(()=> jpadValidator.Validate(null,null)).WithAnyArguments().MustHaveHappened(Exactly.Once);
            A.CallTo(()=> manifestValidator.Validate("manifests/path/to/key.json", 
            A<Func<string,Task<string>>>.Ignored)).MustHaveHappened();
            A.CallTo(()=> jpadValidator.Validate("implementations/jpad/path/to/key.jpad", 
            A<Func<string,Task<string>>>.Ignored)).MustHaveHappened();
        }
    }
}
