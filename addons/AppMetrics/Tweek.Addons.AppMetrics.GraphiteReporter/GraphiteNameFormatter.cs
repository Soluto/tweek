using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using App.Metrics.Formatting.Graphite;

namespace Tweek.Addons.AppMetrics.GraphiteReporter
{
    public class GraphiteNameFormatter : IGraphiteNameFormatter
    {
        private static readonly Regex DotsRegex = new Regex("[.]{2,}", RegexOptions.Compiled);

        private delegate string RenderToken(Dictionary<string, string> context);

        private readonly List<RenderToken> _tokens;

        private static RenderToken Const(string value) => _ => value;

        private static RenderToken Variable(string name)
            => context => context.TryGetValue(name, out var result) ? result : string.Empty;

        private GraphiteNameFormatter(List<RenderToken> tokens)
        {
            _tokens = tokens;
        }
        public IEnumerable<string> Format(GraphitePoint point)
        {
            var tags = point.Tags;
            var tagsDictionary = tags.Keys.Zip(tags.Values, (key, value) => new { key, value })
                .ToDictionary(x => $"tag:{x.key}", x => GraphiteSyntax.EscapeName(x.value), StringComparer.OrdinalIgnoreCase);

            tagsDictionary["context"] = point.Context;
            tagsDictionary["name"] = point.Name;

            foreach (var field in point.Fields)
            {
                tagsDictionary["field"] = field.Key;
                var sb = new StringBuilder(Render(tagsDictionary));

                sb.Append(' ');
                sb.Append(GraphiteSyntax.FormatValue(field.Value));

                sb.Append(' ');
                sb.Append(GraphiteSyntax.FormatTimestamp(point.UtcTimestamp));

                yield return sb.ToString();
            }
        }
        private string Render(Dictionary<string, string> context)
        {
            var builder = new StringBuilder();
            foreach (var token in _tokens)
            {
                builder.Append(GraphiteSyntax.EscapeName(token(context), true));
            }

            return DotsRegex.Replace(builder.ToString().Trim('.'), ".");
        }

        public static GraphiteNameFormatter FromTemplate(string template)
        {
            var tokens = RenderTemplate(template);
            return new GraphiteNameFormatter(tokens);
        }

        private static List<RenderToken> RenderTemplate(string template)
        {
            var result = new List<RenderToken>();
            var variableRegex = new Regex("{.+?}");
            var variableMatches = variableRegex.Matches(template);
            var position = 0;
            foreach (Match match in variableMatches)
            {
                if (match.Index != position)
                {
                    result.Add(Const(template.Substring(position, match.Index - position)));
                }
                result.Add(Variable(match.Value.Trim('{', '}')));
                position = match.Index + match.Value.Length;
            }
            if (position < template.Length)
            {
                result.Add(Const(template.Substring(position)));
            }

            return result;
        }
    }
}
