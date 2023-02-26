<template>
  <div class="modal-backdrop fade show" v-if="showCreateNoteModal"></div>
  <!-- Top row with app title -->
  <div class="container-fluid bg-light py-3">
      <div class="row">
          <div class="col-4 text-center">
              
          </div>
          <div class="col-4 text-center">
              <h4><img src="/img/1password_icon.png" height="36" width="36"> {{title}}</h4>
          </div>
          <div class="col-4 text-end">
              <button type="button" class="btn btn-primary" @click="showCreateNoteModal = true" style="margin-right:20px">
                  <i class="fa-solid fa-pen-to-square"></i>
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
  <div class="container-fluid mt-3">
      <div class="row">
          <div class="col-md-3">
              <ul class="list-group" v-for="(note, index) in notes" v-bind:key="note.id">
                  <li class="list-group-item d-flex justify-content-between align-items-center" :class="{ active: selectedIndex === note.id }" @click="selectNote(note.id)">
                      {{note.title}}
                      <span class="badge bg-secondary rounded-pill">{{note.date}}</span>
                  </li>
              </ul>
          </div>
          <div class="col-md-9">
              <div class="card">
                  <div class="card-header">
                      <input type="text" class="form-control" v-model="currentNote.title" v-if="editMode">
                      <h5 style="margin-top: .5rem; margin-bottom: .5rem;" v-else>{{currentNote.title}}</h5>
                  </div>
                  <div class="card-body">
                      <textarea class="form-control" style="height:500px;" v-model="currentNote.text" v-if="editMode"></textarea>
                      <p v-else style="white-space: pre; overflow-x: auto;">{{currentNote.text}}</p>
                  </div>
                  <div class="card-footer" v-if="selectedIndex !== null">
                      <div style="float:left;">
                        <button class="btn" :class="{ 'btn-primary': !editMode, 'btn-success': editMode }" style="margin-right:10px;" @click="!editMode ? switchEditMode() : updateNote()">
                          {{editNoteLabel}}
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
      host: 'http://notes.snct.nl',
      title: '1Password Notes',
      newNote: {
        title: '',
        text: '',
      },
      currentNote: {
        id: null,
        title: 'No note selected',
        text: 'Select a note to see the contents',
      },
      notes: [],
      selectedIndex: null,
      showCreateNoteModal: false,
      createNoteLabel: 'Create note',
      editNoteLabel: 'Edit',
      editMode: false,
    };
  },
  methods: {
    loadNotes() {
      axios.get(this.host + '/list-notes').then(response => {
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
  selectNote(index) {

      if(this.editMode) {
          if(!confirm("If you open another note, all unsaved changes will be lost. Are you sure?")) {
              return;
          }
      }

      this.selectedIndex = index;
      this.switchViewMode();
      axios.get(this.host + '/note-details/' + index).then(response => {
          this.currentNote = {
              id: response.data[0].id,
              title: response.data[0].title,
              text: response.data[0].text
          }
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

      axios.post(this.host + '/add-note', requestBody).then(response => {
          this.showCreateNoteModal = false;
          this.newNote.title = ''
          this.newNote.text = ''

          setTimeout(this.loadNotes, 1000);
          // handle the response
          // console.log(response.data)
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

      axios.put(this.host + '/update-note', requestBody).then(response => {
          this.switchViewMode();
          setTimeout(this.loadNotes, 1000);
          // handle the response
          console.log(response.data)
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
      axios.delete(this.host + '/delete-note/' + this.selectedIndex).then(response => {
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
  }
  },
  mounted() {
    this.loadNotes();
  },
  watch: {
  },
};
</script>
