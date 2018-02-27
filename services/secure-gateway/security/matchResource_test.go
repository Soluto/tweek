package security

import (
	"reflect"
	"testing"
)

var TestCases = []struct {
	name      string
	given     string
	parsed    PolicyResource
	resource  PolicyResource
	wantMatch bool
	wantError bool
}{
	{
		name:      "Empty",
		given:     "",
		parsed:    PolicyResource{Contexts: map[string]string{}},
		resource:  PolicyResource{},
		wantMatch: false,
		wantError: true,
	},
	{
		name:      "Single Key",
		given:     "/path/to/key",
		parsed:    PolicyResource{Contexts: map[string]string{}, Item: "/path/to/key"},
		resource:  PolicyResource{Contexts: map[string]string{}, Item: "/path/to/key"},
		wantMatch: true,
	},
	{
		name:      "Single context property",
		given:     "property",
		parsed:    PolicyResource{Contexts: map[string]string{}, Item: "property"},
		resource:  PolicyResource{Contexts: map[string]string{}, Item: "property"},
		wantMatch: true,
	},
	{
		name:      "Single context with context property",
		given:     "user=test:prop",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "prop"},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "prop"},
		wantMatch: true,
	},
	{
		name:      "Two contexts with context prop",
		given:     "user=test+device=test2:prop",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "test", "device": "test2"}, Item: "prop"},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test", "device": "test2"}, Item: "prop"},
		wantMatch: true,
	},
	{
		name:      "Multiple contexts with context prop",
		given:     "user=test+device=test2+technician=test3:prop",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "test", "device": "test2", "technician": "test3"}, Item: "prop"},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test", "device": "test2", "technician": "test3"}, Item: "prop"},
		wantMatch: true,
	},
	{
		name:      "Single context with values resource",
		given:     "user=test:/values/path/to/some/key",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "/values/path/to/some/key"},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "/values/path/to/some/key"},
		wantMatch: true,
	},
	{
		name:      "Two contexts with values resource",
		given:     "user=test+device=test2+technician=test3:/values/path/to/some/key",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "test", "device": "test2", "technician": "test3"}, Item: "/values/path/to/some/key"},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test", "device": "test2", "technician": "test3"}, Item: "/values/path/to/some/key"},
		wantMatch: true,
	},
	{
		name:      "Mismatch",
		given:     "user=test:/values/path/to/some/key",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "/values/path/to/some/key"},
		resource:  PolicyResource{Contexts: map[string]string{"device": "test2"}, Item: "/values/path/to/some/key"},
		wantMatch: false,
		wantError: false,
	},
	{
		name:      "Error",
		given:     "user=test:",
		parsed:    PolicyResource{Contexts: map[string]string{}},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "/values/path/to/some/key"},
		wantMatch: false,
		wantError: true,
	},
	{
		name:      "Wildcard for any resource with given context",
		given:     "user=test:*",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "*"},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "/values/path/to/some/key"},
		wantMatch: true,
		wantError: false,
	},
	{
		name:      "Wildcard for context with the given key",
		given:     "user=*:/values/path/to/some/key",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "*"}, Item: "/values/path/to/some/key"},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "/values/path/to/some/key"},
		wantMatch: true,
		wantError: false,
	},
	{
		name:      "Wildcard for context and a key",
		given:     "user=*:/values/*",
		parsed:    PolicyResource{Contexts: map[string]string{"user": "*"}, Item: "/values/*"},
		resource:  PolicyResource{Contexts: map[string]string{"user": "test"}, Item: "/values/path/to/some/key"},
		wantMatch: true,
		wantError: false,
	},
}

func Test_parseResource(t *testing.T) {
	type args struct {
		resource string
	}
	type testcase struct {
		name    string
		args    args
		want    PolicyResource
		wantErr bool
	}

	// adapt the test cases for this test
	var tests = make([]testcase, len(TestCases))
	for i, tcase := range TestCases {
		tests[i] = testcase{
			name:    tcase.name,
			args:    args{resource: tcase.given},
			want:    tcase.parsed,
			wantErr: tcase.wantError,
		}
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, gotErr := parseResource(tt.args.resource)
			if (gotErr != nil) != tt.wantErr {
				t.Errorf("parseResource() error = %v, wantErr %v", gotErr, tt.wantErr)
				return
			}

			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseResource() = %#v, want %#v", got, tt.want)
			}
		})
	}
}

func Test_matchResourcesFunc(t *testing.T) {
	type args struct {
		rr PolicyResource
		pr string
	}
	type testcase struct {
		name    string
		args    args
		want    bool
		wantErr bool
	}

	tests := make([]testcase, len(TestCases))
	for i, tcase := range TestCases {
		tests[i] = testcase{
			name:    tcase.name,
			args:    args{rr: tcase.resource, pr: tcase.given},
			want:    tcase.wantMatch,
			wantErr: tcase.wantError,
		}
	}

	for idx, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := matchResourcesFunc(tt.args.rr, tt.args.pr)
			if (err != nil) != tt.wantErr {
				t.Errorf("matchResourcesFunc() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.want {
				t.Errorf("matchResourcesFunc() = %v, want %v", got, tt.want)
				t.Logf("Unexpected: %#v != %#v", tt.args.rr, TestCases[idx].parsed)
			}
		})
	}
}
