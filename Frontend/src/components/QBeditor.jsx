import React, { useState, useEffect } from "react";
import { CKEditor } from "ckeditor4-react";
import "./QBEditor.css";

const QBEditor = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });
  const [correctOption, setCorrectOption] = useState("");

  const handleOptionChange = (opt, data) => {
    setOptions({ ...options, [opt]: data });
  };

  const handleSubmit = () => {
    const payload = { question, options, correctOption };
    console.log(payload);
    // send payload to backend
  };

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
    }
  }, [question, options]);

  return (
    <div className="qb-container">
      <h2 className="qb-heading">Create Question</h2>

      {/* Question Editor */}
      <div className="editor-section">
        <label className="editor-label">Question:</label>
        <CKEditor
          initData="<p>Type your question here...</p>"
          onChange={(evt) => setQuestion(evt.editor.getData())}
          config={{
            height: 200,
            extraPlugins: "mathjax",
            mathJaxLib: "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML",
            toolbar: [
              ["Bold", "Italic", "Underline", "Subscript", "Superscript"],
              ["NumberedList", "BulletedList"],
              ["Link", "Unlink"],
              ["Image", "Table"],
              ["HorizontalRule"],
              ["Mathjax"], // 
              ["Undo", "Redo"],
              ["Source"]
            ],
            customConfig: "/ckeditor/config.js",
          }}
        />

      </div>

      {/* Options Editors */}
      <div className="options-section">
        {["A", "B", "C", "D"].map((opt) => (
          <div className="editor-section" key={opt}>
            <label className="editor-label">Option {opt}:</label>
            <CKEditor
              initData={`<p>Option ${opt}</p>`}
              onChange={(evt) => handleOptionChange(opt, evt.editor.getData())}
              config={{
                height: 100,
                toolbar: [
                  ["Bold", "Italic", "Underline", "Subscript", "Superscript"],
                  ["NumberedList", "BulletedList"],
                  ["Link", "Unlink"],
                  ["Image", "Table"],
                  ["HorizontalRule"],
                  ["Mathjax"], // 
                  ["Undo", "Redo"],
                  ["Source"]
                ]
              }}
            />
          </div>
        ))}
      </div>

      {/* Correct Option Selector */}
      <div className="correct-section">
        <label>Correct Option:</label>
        <select
          value={correctOption}
          onChange={(e) => setCorrectOption(e.target.value)}
        >
          <option value="">Select Correct Option</option>
          {["A", "B", "C", "D"].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <button className="qb-btn" onClick={handleSubmit}>
        Save Question
      </button>
    </div>
  );
};

export default QBEditor;
