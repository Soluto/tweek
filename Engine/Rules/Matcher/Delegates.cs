using Engine.Core.Context;
using Engine.Match.DSL;

namespace Engine.Rules.Matcher
{
    public delegate Matcher MatcherParser(string matcher);
    public delegate bool Matcher(GetContextValue fullContext);

    public static class Creation
    {
        public static Matcher Parser(string schema)
        {
            return context =>
            {
                return MatchDSL.Match_ext(schema, key => context(key).Match(x => x, () => null));
            };
        }    
    }
}
