package authorization

test_authorize_repo {
    authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {},
        "object": "repo",
        "action": "read"
    }
}

test_authorize_allowed_key {
    authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {},
        "object": "keys.test/key",
        "action": "read"
    }
}

test_dont_authorize_denied_key {
    not authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": { "user": "tester" },
        "object": "keys.denied/key",
        "action": "read"
    }
}

test_authorize_allow_self_context_property {
    authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {"user": "self"},
        "object": "user.name",
        "action": "write"
    }
}

test_authorize_allow_read_schema {
    authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {},
        "object": "repo.schema",
        "action": "read"
    }
}

test_authorize_deny_non_self_context_property {
    not authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {"device": "testdevice"},
        "object": "device.isTest",
        "action": "write"
    }
}

test_authorize_deny_unallowed_action {
    not authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {"user": "self", "device": "testdevice"},
        "object": "keys.test/key",
        "action": "write"
    }
}

test_authorize_allow_allowed_action {
    authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {"user": "self", "device": "testdevice"},
        "object": "keys.test/key",
        "action": "read"
    }
}

test_authorize_deny_mismatching_contexts {
    not authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {"user": "tester", "device": "testdevice"},
        "object": "keys.test/key",
        "action": "read"
    }
}

test_authorize_deny_extra_context {
    not authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {"user": "self", "device": "testdevice", "extra": "extra"},
        "object": "keys.test/key",
        "action": "read"
    }
}

test_authorize_allow_wildcard_context {
    authorize with input as {
        "user": "00000000-0000-0000-0000-000000000000",
        "group": "default",
        "contexts": {"user": "self", "device": "testdevice", "extra": "extra"},
        "object": "keys.test/key_with_wildcard_context",
        "action": "read"
    }
}

test_authorize_allow_scoped_key_editing {
    authorize with input as {
        "user": "limited-editor",
        "group": "default",
        "contexts": {},
        "object": "repo/keys/my_key",
        "action": "write"
    }
}

test_authorize_deny_scoped_bulk_keys_upload {
    not authorize with input as {
        "user": "limited-editor",
        "group": "default",
        "contexts": {},
        "object": "repo/keys/_",
        "action": "write"
    }
}
