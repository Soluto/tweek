package authorization

context_items_mismatch(from_input,from_data) = true {
    a = from_input[i]
    b = from_data[i]
    not match_wildcards(a, b)
}

context_items_count_mismatch(from_input,from_data) = true {
    a = { item | from_input[item] }
    b = { item | from_data[item] }
    a != b
}

match_contexts(from_input,from_data) = true {
    not context_items_mismatch(from_input, from_data)
    not context_items_count_mismatch(from_input, from_data)
}

match_wildcards(a,b) = true {
    a = b
} else = true {
    b = "*"
} else = false {
    a != b
}

match_with_prefix(a,b) = true {
    sp = split(b, "*")
    prefix = sp[0]
    startswith(a, prefix)
}

default allow = false

allow = true {
    p = data.policies[_]
    match_wildcards(input.user, p.user)
    match_wildcards(input.group, p.group)
    match_wildcards(input.action, p.action)
    match_with_prefix(input.object, p.object)
    p.effect = "allow"
    match_contexts(input.contexts, p.contexts)
}

default deny = false
deny = true {
    p = data.policies[_]
    match_wildcards(input.user, p.user)
    match_wildcards(input.group, p.group)
    match_wildcards(input.action, p.action)
    match_with_prefix(input.object, p.object)
    p.effect = "deny"
    match_contexts(input.contexts, p.contexts)
}

default authorize = false
authorize = true {
    allow
    not deny
}
