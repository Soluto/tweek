package security

import (
	"reflect"
	"testing"
)

var TestCases = []struct {
	name      string
	given     string
	parsed    map[string]string
	resource  map[string]string
	wantMatch bool
	wantError bool
}{
	{
		name:     "Empty",
		given:    "",
		parsed:   map[string]string{},
		resource: map[string]string{},
	},
	{
		name:     "Single Key",
		given:    "/path/to/key",
		parsed:   map[string]string{"": "/path/to/key"},
		resource: map[string]string{"": "/path/to/key"},
	},
	{
		name:     "Single context property",
		given:    "property",
		parsed:   map[string]string{"": "property"},
		resource: map[string]string{"": "property"},
	},
	{
		name:     "Single context with context property",
		given:    "user=test:prop",
		parsed:   map[string]string{"user": "test", "": "prop"},
		resource: map[string]string{"user": "test", "": "prop"},
	},
	{
		name:     "Two contexts with context prop",
		given:    "user=test+device=test2:prop",
		parsed:   map[string]string{"user": "test", "device": "test2", "": "prop"},
		resource: map[string]string{"user": "test", "device": "test2", "": "prop"},
	},
	{
		name:     "Multiple contexts with context prop",
		given:    "user=test+device=test2+technician=test3:prop",
		parsed:   map[string]string{"user": "test", "device": "test2", "technician": "test3", "": "prop"},
		resource: map[string]string{"user": "test", "device": "test2", "technician": "test3", "": "prop"},
	},
	{
		name:     "Single context with values resource",
		given:    "user=test:/values/path/to/some/key",
		parsed:   map[string]string{"user": "test", "": "/values/path/to/some/key"},
		resource: map[string]string{"user": "test", "": "/values/path/to/some/key"},
	},
	{
		name:     "Two contexts with values resource",
		given:    "user=test+device=test2+technician=test3:/values/path/to/some/key",
		parsed:   map[string]string{"user": "test", "device": "test2", "technician": "test3", "": "/values/path/to/some/key"},
		resource: map[string]string{"user": "test", "device": "test2", "technician": "test3", "": "/values/path/to/some/key"},
	},
}

func Test_parseResource(t *testing.T) {
	type args struct {
		resource string
	}
	type testcase struct {
		name    string
		args    args
		want    map[string]string
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
			t.Logf("Testing: %#v", tt)
			got, gotErr := parseResource(tt.args.resource)
			if gotErr != nil {
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
		rr map[string]string
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

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := matchResourcesFunc(tt.args.rr, tt.args.pr)
			if (err != nil) != tt.wantErr {
				t.Errorf("matchResourcesFunc() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("matchResourcesFunc() = %v, want %v", got, tt.want)
			}
		})
	}
}
