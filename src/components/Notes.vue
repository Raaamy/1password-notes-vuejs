<template>
  <div class="modal-backdrop fade show" v-if="showCreateNoteModal"></div>
  <!-- Top row with app title -->
  <div class="container-fluid bg-light py-3">
      <div class="row">
          <div class="col-4">
            <div v-if="!isMobile || currentNote.id == null">
              <h5><img src="/img/1password_icon.png" height="24" width="24"> {{title}}</h5>
            </div>
            <div v-else>
                <button @click="resetView()" type="button" class="btn btn-primary">
                    <i class="fa-solid fa-arrow-left"></i> Go back
                </button>
            </div>
          </div>
          <div class="col-8 text-end">
              <button type="button" class="btn btn-light" @click="logout()" style="margin-right:20px">
                <i class="fa fa-sign-out" aria-hidden="true"></i>
              </button>
              <button type="button" class="btn btn-primary" @click="showCreateNoteModal = true" style="margin-right:20px">
                  <i class="fa-solid fa-plus"></i> Add note
              </button>
          </div>
      </div>
  </div>
  
  <!-- Modal to create new note -->
  <div class="modal modal-xl d-block fade show" tabindex="-1" role="dialog" v-if="showCreateNoteModal">
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title" id="createNoteModalLabel">Create New Note</h5>
                  <button type="button" class="btn-close" @click="showCreateNoteModal = false" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                  <form>
                      <div class="mb-3">
                          <label for="noteTitle" class="form-label">Title</label>
                          <input type="text" class="form-control" id="noteTitle" name="noteTitle" v-model="newNote.title" required >
                      </div>
                      <div class="mb-3">
                          <label for="noteBody" class="form-label">Note</label>
                          <textarea class="form-control" id="noteBody" name="noteBody" rows="15" v-model="newNote.text" required></textarea>
                      </div>
                  </form>
              </div>
              <div class="modal-footer">
                  <button type="submit" class="btn btn-primary" form="createNoteForm" @click="addNote">{{createNoteLabel}}</button>
              </div>
          </div>
      </div>
  </div>

  <!-- Split view with note list on the left and note content on the right -->
  <div class="container-fluid mt-3 mb-3">
      <div class="row">
          <div class="col-md-3" v-if="!isMobile || currentNote.id == null">
              <ul class="list-group">
                  <li class="list-group-item d-flex justify-content-between align-items-center" v-for="(note, index) in notes" v-bind:key="note.id" :class="{ active: selectedIndex === note.id }" @click="selectNote(note.id)" style="font-size:14px;">
                      {{note.title}}
                      <span class="badge bg-secondary rounded-pill">{{note.date}}</span>
                  </li>
              </ul>
          </div>
          <div class="col-md-9" v-if="!isMobile || currentNote.id !== null">
              <div class="card">
                  <div class="card-header">
                      <input type="text" class="form-control" v-model="currentNote.title" v-if="editMode">
                      <h5 style="margin-top: .5rem; margin-bottom: .5rem;" :class="{ 'fst-italic': currentNote.id == null }" v-else>{{currentNote.title}}</h5>

                      <div v-if="!editMode && currentNote.id !== null">
                        <a :href="`https://my.1password.com/vaults/${requestHeaders.headers.OP_VAULT_UUID}/allitems/${currentNote.id}`" target="_blank" class="btn btn-link" style="font-size:12px; padding:0; display: ;">
                            <i class="fa-solid fa-external-link"></i> Open on 1Password.com
                        </a>
                        <a :href="`onepassword://open/${requestHeaders.headers.OP_VAULT_UUID}/${currentNote.id}`" class="btn btn-link" style="font-size:12px; padding:0; display: table-row;">
                            <i class="fa-solid fa-external-link"></i> Open in 1Password-app
                        </a>
                      </div>
                  </div>
                  <div class="card-body">
                      <textarea class="form-control" style="height:400px; font-size:15px;" v-model="currentNote.text" v-if="editMode"></textarea>
                      <p v-else style="white-space: pre; overflow-x: auto; font-size:15px;">{{currentNote.text}}</p>
                      
                      <div class="mb-3" v-if="editMode && currentNote.files.length > 0"></div>

                      <div v-if="currentNote.files.length > 0">
                        <ul class="list-group">
                            <li class="list-group-item" v-for="file in currentNote.files" v-bind:key="file.id">
                                <i class="fas fa-paperclip me-2"></i><span style="font-size:14px;">{{file.name}}</span> <small>({{formatFileSize(file.size)}})</small>
                            </li>
                        </ul>
                        <span style="font-size:12px">* Attachments can only be opened in the 1Password app</span>
                      </div>

                  </div>
                  <div class="card-footer" v-if="selectedIndex !== null">
                      <div style="float:left;">
                        <button class="btn" :class="{ 'btn-secondary': !editMode, 'btn-success': editMode }" style="margin-right:10px;" @click="!editMode ? switchEditMode() : updateNote()">
                            {{ editNoteLabel }}
                        </button>
                        <span v-if="editMode" style="cursor:pointer; margin-left:20px" @click="cancelChanges()">Cancel</span>
                      </div>
                      <div style="float:right;">
                          <button type="button" class="btn btn-danger" @click="deleteNote()">
                              <i class="fa-solid fa-trash"></i>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MyNotes',
  data() {
    return {
      host: 'http://192.168.192.1:8000',
      //host: 'http://localhost:8000',
      title: 'Notes',
      requestHeaders: {
        headers: {
            OP_API_TOKEN: localStorage.getItem('op_api_token') || null,
            OP_VAULT_UUID: localStorage.getItem('op_vault_uuid') || null,
            OP_CONNECT_SERVER_URL: localStorage.getItem('op_connect_server_host') || null,
        }
      },
      newNote: {
        title: '',
        text: '',
      },
      currentNote: {
        id: null,
        title: 'No note selected',
        text: 'Select a note to see the contents',
        files: [],
      },
      notes: [],
      selectedIndex: null,
      showCreateNoteModal: false,
      createNoteLabel: 'Create note',
      editNoteLabel: 'Edit',
      editMode: false,
      isMobile: false
    };
  },
  methods: {
    loadNotes() {
      axios.get(this.host + '/list-notes', this.requestHeaders).then(response => {
          this.notes = response.data.map(item => {
              return {
                  id: item.id,
                  title: item.title,
                  text: item.text,
                  date: item.date
              };
          });
      })
      .catch(error => {
          console.log(error);
      });
    },
    resetView() { 

        // Ask for confirmation if editing note
        if(this.editMode) {
            if(!confirm("If you open another note, all unsaved changes will be lost. Are you sure?")) {
                return;
            }
        }

        this.currentNote = {
            id: null,
            title: 'No note selected',
            text: 'Select a note to see the contents',
            files: [],
        };

        // Set correct view mode
        this.selectedIndex = null;
        this.switchViewMode(); 
    },
    selectNote(index) {

        // Ask for confirmation if editing note
        if(this.editMode) {
            if(!confirm("If you open another note, all unsaved changes will be lost. Are you sure?")) {
                return;
            }
        }

        // Set correct view mode
        this.selectedIndex = index;
        this.switchViewMode();

        // Get note 
        axios.get(this.host + '/note-details/' + index, this.requestHeaders).then(response => {
            this.currentNote = {
                id: response.data[0].id,
                title: response.data[0].title,
                text: response.data[0].text,
                files: []
            }

            // Get note files
            this.getNoteFiles(index);
        })
        .catch(error => {
            console.log(error);
        });
    },
    getNoteFiles(index) {
        axios.get(this.host + '/note-details/' + index + '/files', this.requestHeaders).then(response => {
            this.currentNote.files = response.data;
        })
        .catch(error => {
            console.log(error);
        });
    },
    addNote() {
        const requestBody = {
            title: this.newNote.title,
            text: this.newNote.text
        }

        this.createNoteLabel = 'Saving...';

        axios.post(this.host + '/add-note', requestBody, this.requestHeaders).then(response => {
            // Reset create note popup
            this.showCreateNoteModal = false;
            this.newNote.title = ''
            this.newNote.text = ''

            // Replace text in note preview
            this.currentNote = {
                id: response.data,
                title: requestBody.title,
                text: requestBody.text,
                files: []
            }

            // Preselect new note
            this.selectedIndex = response.data;
            
            setTimeout(() => {
                // Execute this after 1000ms
                this.loadNotes();
            }, 1000);
        })
        .catch(error => {
            // handle the error
            console.error(error)
        });
    },
    updateNote() {
        const requestBody = {
            id: this.currentNote.id,
            title: this.currentNote.title,
            text: this.currentNote.text
        }

        axios.put(this.host + '/update-note', requestBody, this.requestHeaders).then(response => {
            this.switchViewMode();
            setTimeout(this.loadNotes, 1000);
            // handle the response
        })
        .catch(error => {
            // handle the error
            console.error(error)
        });
    },
    cancelChanges() {
        if(!confirm("Are you sure you want to cancel all changes?")) {
            return;
        }
        this.switchViewMode();
        this.selectNote(this.selectedIndex);
    },
    deleteNote() {
        if(!confirm("Are you sure you want to delete this note?")) {
            return;
        }
        axios.delete(this.host + '/delete-note/' + this.selectedIndex, this.requestHeaders).then(response => {
            setTimeout(this.loadNotes, 1000);
        })
    },
    switchEditMode() {
        this.editMode = true;
        this.editNoteLabel = "Save changes";
    },
    switchViewMode() {
        this.editMode = false;
        this.editNoteLabel = "Edit";
    },
    logout() {
        for (let key in localStorage) {
            if (key === 'op_api_token' || key === 'op_vault_uuid' || key === 'op_connect_server_host') {
                localStorage.removeItem(key);
            }
        }
        window.location.reload();
    },
    formatFileSize(size) {
        if (size >= 1073741824) {
        return (size / 1073741824).toFixed(2) + ' GB';
        } else if (size >= 1048576) {
        return (size / 1048576).toFixed(2) + ' MB';
        } else if (size >= 1024) {
        return (size / 1024).toFixed(2) + ' KB';
        } else {
        return size + ' bytes';
        }
    }
  },
  mounted() {
    this.isMobile = window.screen.width < 768 || window.screen.height < 768 ? true : false;
    this.loadNotes();
    document.addEventListener('keydown', (event) => {
      if (this.editMode && event.key === 'Escape') {
        this.cancelChanges();
      }
    });
  },
  beforeUnmount() {
    document.removeEventListener('keydown', () => {});
  },
  watch: {
  },
};
</script>
