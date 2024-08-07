const mongoose = require("mongoose");
const slugify = require("slugify");

const BookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Please add a titile"],
            unique: true,
            trim: true,
            maxlength: [100, "Book title can't be more than 100 characters"],
        },
        slug: String,
        published: { type: Boolean, default: false },
        description: {
            type: String,
            required: [true, "Please add a description"],
        },
        subtitle: {
            type: String,
            required: [true, "Please add a subtitle"],
            trim: true,
            maxlength: [100, "Book subtitle can't be more than 100 characters"],
        },
        author: {
            type: String,
            required: [true, "Please add an author"],
            trim: true,
        },
        isbn: {
            type: String,
            required: [true, "Please add an isbn number"],
            trim: true,
            maxlength: [13, "ISBN number can't be more than 13 characters"],
        },
    },
    {
        timestamps: true,
    }
);

BookSchema.pre("save", function (next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

module.exports = mongoose.model("Book", BookSchema);