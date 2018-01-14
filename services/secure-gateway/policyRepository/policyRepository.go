package policyRepository

import (
	"crypto/x509"
	"encoding/pem"
	"errors"
	"io/ioutil"
	"path"
	"sync"
	"time"

	"gopkg.in/src-d/go-git.v4/plumbing/transport"

	"golang.org/x/crypto/ssh"

	"gopkg.in/src-d/go-git.v4/plumbing/object"
	gogitSSH "gopkg.in/src-d/go-git.v4/plumbing/transport/ssh"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/casbin/casbin/file-adapter"
	"github.com/casbin/casbin/model"
	"github.com/casbin/casbin/persist"
	git "gopkg.in/src-d/go-git.v4" // git
)

var (
	// ErrUnsupportedOperation is the error returned for unsupported operations
	ErrUnsupportedOperation = errors.New("Unsupported operation")
)

type gitCasbinAdapter struct {
	repo        *git.Repository
	fileadapter persist.Adapter
	upstream    string
	lock        *sync.RWMutex
	workdir     string
}

func (a *gitCasbinAdapter) refreshRepo() error {
	a.lock.Lock()
	defer a.lock.Unlock()

	if tree, err := a.repo.Worktree(); err != nil {
		err := tree.Pull(&git.PullOptions{Force: true, SingleBranch: true})
		if err != nil {
			return err
		}
	}

	return nil
}

func (a *gitCasbinAdapter) commitAndPush() error {
	if err := a.refreshRepo(); err != nil {
		return err
	}

	tree, err := a.repo.Worktree()
	if err != nil {
		return err
	}

	a.lock.Lock()
	defer a.lock.Unlock()

	_, err = tree.Add(path.Join(a.workdir, "model.csv"))
	if err != nil {
		return err
	}

	_, err = tree.Commit("Updated policy rules", &git.CommitOptions{
		Author: &object.Signature{
			Email: "secure-gateway",
			Name:  "secure-gateway",
			When:  time.Now().UTC(),
		},
	})
	if err != nil {
		return err
	}

	err = a.repo.Push(&git.PushOptions{})

	return err
}

func (a *gitCasbinAdapter) LoadPolicy(model model.Model) error {
	err := a.refreshRepo()
	if err != nil {
		return err
	}

	err = a.fileadapter.LoadPolicy(model)
	return err
}

func (a *gitCasbinAdapter) SavePolicy(model model.Model) error {
	if err := a.fileadapter.SavePolicy(model); err != nil {
		return err
	}

	err := a.commitAndPush()
	return err
}

func (a *gitCasbinAdapter) AddPolicy(sec string, ptype string, rule []string) error {
	return ErrUnsupportedOperation
}

func (a *gitCasbinAdapter) RemovePolicy(sec string, ptype string, rule []string) error {
	return ErrUnsupportedOperation
}

func (a *gitCasbinAdapter) RemoveFilteredPolicy(sec string, ptype string, fieldIndex int, fieldValues ...string) error {
	return ErrUnsupportedOperation
}

// New creates a git adapter for policy storage
func New(workdir string, repoConfig *config.PolicyRepository) (result persist.Adapter, err error) {
	result = nil
	auth, err := setupAuthentication(repoConfig.SecretKey)
	if err != nil {
		return
	}

	repo, err := git.PlainClone(workdir, false, &git.CloneOptions{
		URL:  repoConfig.UpstreamURL,
		Auth: auth,
	})
	if err != nil {
		return
	}

	adapter := fileadapter.NewAdapter(path.Join(workdir, repoConfig.CasbinModel))

	result = &gitCasbinAdapter{
		repo:        repo,
		fileadapter: adapter,
		upstream:    repoConfig.UpstreamURL,
		workdir:     workdir,
	}

	return
}

func setupAuthentication(secretKeyFile string) (auth transport.AuthMethod, err error) {
	pemFile, err := ioutil.ReadFile(secretKeyFile)
	if err != nil {
		return
	}

	signer, err := ssh.ParsePrivateKey(pemFile)
	if err != nil {
		var key interface{}
		block, _ := pem.Decode(pemFile)
		key, err = x509.ParsePKCS8PrivateKey(block.Bytes)
		if err != nil {
			key, err = x509.ParsePKCS1PrivateKey(block.Bytes)
			if err != nil {
				return
			}
		}

		signer, err = ssh.NewSignerFromKey(key)
		if err != nil {
			return
		}
	}

	auth = &gogitSSH.PublicKeys{User: "git", Signer: signer}
	return
}
