import React, { useState, useEffect, useRef } from "react";
import { CKEditor } from "ckeditor4-react";
import "./QBEditor.css";

const QBEditorModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState({
    A: { text: "", is_correct: false },
    B: { text: "", is_correct: false },
    C: { text: "", is_correct: false },
    D: { text: "", is_correct: false }
  });

  // optional: keep refs to editor instances if you need to manipulate them later
  const editorsRef = useRef({ question: null, A: null, B: null, C: null, D: null });

  // Open modal and initialize state once (so editors receive initial content only at mount)
  const openModal = () => {
    setShowModal(true);
  };

  // safe functional updates
  const handleOptionChange = (opt, data) => {
    setOptions((prev) => ({ ...prev, [opt]: { ...prev[opt], text: data } }));
  };

  const handleCorrectToggle = (opt) => {
    setOptions((prev) => ({ ...prev, [opt]: { ...prev[opt], is_correct: !prev[opt].is_correct } }));
  };

  const handleSubmit = async () => {
    const payload = {
      question_text: question,
      options: ["A", "B", "C", "D"].map((opt) => ({
        text: options[opt].text,
        is_correct: options[opt].is_correct
      }))
    };

    try {
      const response = await fetch("http://localhost:8080/api/v1/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      console.log("Server response:", data);

      // reset and close modal
      setShowModal(false);
      setQuestion("");
      setOptions({
        A: { text: "", is_correct: false },
        B: { text: "", is_correct: false },
        C: { text: "", is_correct: false },
        D: { text: "", is_correct: false }
      });
    } catch (err) {
      console.error("Failed to save question:", err);
    }
  };

  // MathJax typeset after changes (fine to keep)
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
    }
  }, [question, options]);

  return (
    <div className="qbeditor-cont">
      <button className="qb-btn add-question" onClick={openModal}>
        Add Question
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="qb-heading">Create Question</h2>

            <div className="editor-section">
              <label className="editor-label">Question:</label>
              <CKEditor
                initData={question}
                onInstanceReady={(evt) => {
                  const ed = evt.editor;
                  editorsRef.current.question = ed;
                  const placeholder = "Type your question here...";
                  if (!ed.getData() || ed.getData().trim() === "") {
                    ed.setData(`<p style="color:#888">${placeholder}</p>`);
                  }

                  ed.on("focus", () => {
                    if (ed.getData().includes(placeholder)) ed.setData("");
                  });
                  ed.on("blur", () => {
                    if (!ed.getData().trim()) ed.setData(`<p style="color:#888">${placeholder}</p>`);
                  });
                }}
                onChange={(evt) => setQuestion(evt.editor.getData())}
                config={{
                  height: 200,
                  extraPlugins: "mathjax",
                  mathJaxLib:
                    "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML",
                  toolbar: [
                    ["Bold", "Italic", "Underline", "Subscript", "Superscript"],
                    ["NumberedList", "BulletedList"],
                    ["Link", "Unlink"],
                    ["Image", "Table"],
                    ["HorizontalRule"],
                    ["Mathjax"],
                    ["Undo", "Redo"],
                    ["Source"]
                  ],
                  customConfig: "/ckeditor/config.js"
                }}
              />
            </div>

            {/* Options editors */}
            <div className="options-section">
              {["A", "B", "C", "D"].map((opt) => (
                <div className="editor-section" key={opt}>
                  <label className="editor-label">Option {opt}:</label>

                  <CKEditor
                    key={opt}
                    initData={options[opt].text || ""}
                    onInstanceReady={(evt) => {
                      const editor = evt.editor;
                      const placeholder = `Type option ${opt} here...`;

                      if (!editor.getData()) {
                        editor.setData(`<p style="color:#888">${placeholder}</p>`);
                      }

                      editor.on("focus", () => {
                        if (editor.getData().includes(placeholder)) {
                          editor.setData("");   // auto clear placeholder when focused
                        }
                      });

                      editor.on("blur", () => {
                        if (!editor.getData().trim()) {
                          editor.setData(`<p style="color:#888">${placeholder}</p>`);
                        }
                      });
                    }}
                    onChange={(evt) => handleOptionChange(opt, evt.editor.getData())}
                    config={{
                      height: 100,
                      toolbar: [
                        ["Bold", "Italic", "Underline", "Subscript", "Superscript"],
                        ["NumberedList", "BulletedList"],
                        ["Link", "Unlink"],
                        ["Image", "Table"],
                        ["HorizontalRule"],
                        ["Mathjax"],
                        ["Undo", "Redo"],
                        ["Source"],
                      ],
                    }}
                  />


                  <div className="correct-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={options[opt].is_correct}
                        onChange={() => handleCorrectToggle(opt)}
                      />{" "}
                      Correct
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="qb-btn" onClick={handleSubmit}>
                Save Question
              </button>
              <button className="qb-btn cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QBEditorModal;
