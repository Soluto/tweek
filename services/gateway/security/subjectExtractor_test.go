package security

import (
	"context"
	"io/ioutil"
	"testing"

	jwt "github.com/dgrijalva/jwt-go"
)

func TestDefaultSubjectExtractor_ExtractSubject(t *testing.T) {
	type args struct {
		claims jwt.MapClaims
	}
	tests := []struct {
		name    string
		args    args
		want    string
		wantErr bool
	}{
		{
			name: "Google",
			args: args{
				claims: jwt.MapClaims{
					"iss": "https://accounts.google.com",
					"sub": "test",
				},
			},
			want:    "google:test",
			wantErr: false,
		},
		{
			name: "Azure",
			args: args{
				claims: jwt.MapClaims{
					"iss": "https://login.microsoftonline.com/11111111-1111-1111-1111-111111111111",
					"sub": "test",
				},
			},
			want:    "azure:test",
			wantErr: false,
		},
		{
			name: "Nothing",
			args: args{
				claims: jwt.MapClaims{},
			},
			want:    "",
			wantErr: true,
		},
	}
	for _, tt := range tests {
		ctx := context.Background()
		t.Run(tt.name, func(t *testing.T) {
			rules, err := ioutil.ReadFile("./testdata/rules.rego")
			if err != nil {
				t.Fatal("Unable to read rules file")
			}

			e := NewDefaultSubjectExtractor(string(rules), "rules", "subject")
			got, err := e.ExtractSubject(ctx, tt.args.claims)
			if (err != nil) != tt.wantErr {
				t.Errorf("DefaultUserAndGroupExtractor.ExtractUserAndGroup() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("DefaultUserAndGroupExtractor.ExtractUserAndGroup() = %v, want %v", got, tt.want)
			}
		})
	}
}
