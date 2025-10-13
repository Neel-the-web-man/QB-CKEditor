import React, { useState, useEffect } from "react";
import parse from "html-react-parser";
import { CKEditor } from "ckeditor4-react";
import "./QuestionBank.css";

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editQuestion, setEditQuestion] = useState("");
    const [editOptions, setEditOptions] = useState({
        A: { text: "", is_correct: false },
        B: { text: "", is_correct: false },
        C: { text: "", is_correct: false },
        D: { text: "", is_correct: false },
    });

    const fetchQuestions = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/v1/questions");
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            setQuestions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/questions/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error(`Failed to delete question ${id}`);
            setQuestions((prev) => prev.filter((q) => q.id !== id));
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const handleEdit = (id) => {
        const q = questions.find((item) => item.id === id);
        setEditId(id);
        setEditQuestion(q.question_text);

        // Map existing options to A–D
        const updatedOpts = { ...editOptions };
        q.options.forEach((opt, idx) => {
            const letter = ["A", "B", "C", "D"][idx];
            updatedOpts[letter] = { text: opt.text, is_correct: opt.is_correct };
        });
        setEditOptions(updatedOpts);

        setShowModal(true);
    };

    const handleOptionChange = (opt, data) => {
        setEditOptions({ ...editOptions, [opt]: { ...editOptions[opt], text: data } });
    };

    const handleCorrectToggle = (opt) => {
        setEditOptions({
            ...editOptions,
            [opt]: { ...editOptions[opt], is_correct: !editOptions[opt].is_correct },
        });
    };

    const handleSubmitEdit = async () => {
        const payload = {
            question_text: editQuestion,
            options: ["A", "B", "C", "D"].map((opt) => ({
                text: editOptions[opt].text,
                is_correct: editOptions[opt].is_correct,
            })),
        };

        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/questions/${editId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error("Failed to update question");
            await fetchQuestions();
            setShowModal(false);
        } catch (error) {
            console.error("Error editing question:", error);
        }
    };

    if (loading) return <p className="qb-comp-loading">Loading questions...</p>;
    if (!questions.length) return <p className="qb-comp-no-questions">No questions present.</p>;

    return (
        <>
            <div className="qb-comp-container">
                {questions.map((q) => (
                    <div className="qb-comp-card" key={q.id}>
                        <div className="qb-comp-card-header">
                            <span className="qb-comp-card-id">Q{q.id}</span>
                            <div className="qb-comp-card-actions">
                                <button
                                    className="qb-comp-btn qb-comp-edit"
                                    onClick={() => handleEdit(q.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="qb-comp-btn qb-comp-delete"
                                    onClick={() => handleDelete(q.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="qb-comp-question">{parse(q.question_text)}</div>

                        <div className="qb-comp-options">
                            {q.options.map((opt, i) => (
                                <div className="qb-comp-option" key={i}>
                                    {parse(opt.text)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            x
                        </button>
                        <h2 className="qb-heading">Edit Question</h2>

                        <div className="editor-section">
                            <label className="editor-label">Question:</label>
                            <CKEditor
                                key={editId}
                                initData={editQuestion}  
                                onChange={(evt) => setEditQuestion(evt.editor.getData())}
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
                                        ["Source"],
                                    ],
                                }}
                            />
                        </div>

                        <div className="options-section">
                            {["A", "B", "C", "D"].map((opt) => (
                                <div className="editor-section" key={opt}>
                                    <label className="editor-label">Option {opt}:</label>
                                    <CKEditor
                                        key={`${editId}-${opt}`}
                                        initData={editOptions[opt].text}
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
                                                checked={editOptions[opt].is_correct}
                                                onChange={() => handleCorrectToggle(opt)}
                                            />{" "}
                                            Correct
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="qb-btn" onClick={handleSubmitEdit}>
                                Edit Question
                            </button>
                            <button className="qb-btn cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuestionBank;
