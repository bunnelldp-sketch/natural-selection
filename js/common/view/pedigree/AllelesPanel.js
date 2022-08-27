// Copyright 2019-2022, University of Colorado Boulder

/**
 * AllelesPanel is the panel that contains controls for showing alleles in the 'Pedigree' graph.
 * Each row in the panel corresponds to one gene.  Until a gene has mutated, its row is disabled,
 * because a gene pair cannot be abbreviated until a dominance relationship exists, and a dominance
 * relationship does not exists until both the normal and mutant alleles exist in the population.
 * When a row is enabled, it shows the icon and abbreviation for the normal allele and the mutant allele.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../../phetcommon/js/AssertUtils.js';
import { AlignBox, AlignGroup, HBox, HStrut, Image, Text, VBox } from '../../../../../scenery/js/imports.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import naturalSelection from '../../../naturalSelection.js';
import naturalSelectionStrings from '../../../naturalSelectionStrings.js';
import Gene from '../../model/Gene.js';
import GenePool from '../../model/GenePool.js';
import NaturalSelectionConstants from '../../NaturalSelectionConstants.js';
import NaturalSelectionQueryParameters from '../../NaturalSelectionQueryParameters.js';
import NaturalSelectionPanel from '../NaturalSelectionPanel.js';

class AllelesPanel extends NaturalSelectionPanel {

  /**
   * @param {GenePool} genePool
   * @param {Property.<boolean>} furAllelesVisibleProperty
   * @param {Property.<boolean>} earsAllelesVisibleProperty
   * @param {Property.<boolean>} teethAllelesVisibleProperty
   * @param {Object} [options]
   */
  constructor( genePool, furAllelesVisibleProperty, earsAllelesVisibleProperty, teethAllelesVisibleProperty, options ) {

    assert && assert( genePool instanceof GenePool, 'invalid genePool' );
    assert && AssertUtils.assertPropertyOf( furAllelesVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( earsAllelesVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( teethAllelesVisibleProperty, 'boolean' );

    options = merge( {

      // phet-io
      tandem: Tandem.REQUIRED
    }, NaturalSelectionConstants.PANEL_OPTIONS, options );

    // To make the abbreviation + icon for all alleles the same effective size
    const alleleAlignGroup = new AlignGroup();

    // Alleles - title is plural, since we're always showing at least 2 alleles
    const titleNode = new Text( naturalSelectionStrings.allelesProperty, {
      font: NaturalSelectionConstants.TITLE_FONT,
      maxWidth: 125, // determined empirically
      tandem: options.tandem.createTandem( 'titleNode' )
    } );

    // A row for each gene
    const furRow = new Row( genePool.furGene, furAllelesVisibleProperty, alleleAlignGroup, {
      tandem: options.tandem.createTandem( 'furRow' )
    } );
    const earsRow = new Row( genePool.earsGene, earsAllelesVisibleProperty, alleleAlignGroup, {
      tandem: options.tandem.createTandem( 'earsRow' )
    } );
    const teethRow = new Row( genePool.teethGene, teethAllelesVisibleProperty, alleleAlignGroup, {
      tandem: options.tandem.createTandem( 'teethRow' )
    } );
    const rows = [ furRow, earsRow, teethRow ];

    const content = new VBox( merge( {}, NaturalSelectionConstants.VBOX_OPTIONS, {
      spacing: 28,
      children: [ titleNode, ...rows ]
    } ) );

    super( content, options );

    // @private {Row[]}
    this.rows = rows;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }

  /**
   * Sets visibility of the UI components related to a specific gene.
   * @param {Gene} gene
   * @param {boolean} visible
   * @public
   */
  setGeneVisible( gene, visible ) {
    assert && assert( gene instanceof Gene, 'invalid gene' );
    assert && assert( typeof visible === 'boolean', 'invalid visible' );

    const row = _.find( this.rows, row => ( row.gene === gene ) );
    assert && assert( row, `row not found for ${gene.name} gene` );
    row.visible = visible;
  }
}

/**
 * Row is a row in AllelesPanel.
 *
 * Each row has a checkbox for showing allele abbreviations in the Pedigree graph, and icons that indicate the
 * phenotype for each abbreviation (e.g. 'F' <white fur icon>  'f' <brown fur icon>).  A row is hidden until
 * its corresponding mutation has been applied.
 */
class Row extends VBox {

  /**
   * @param {Gene} gene
   * @param {Property.<boolean>} visibleProperty
   * @param {AlignGroup} alignGroup
   * @param {Object} [options]
   */
  constructor( gene, visibleProperty, alignGroup, options ) {

    assert && assert( gene instanceof Gene, 'invalid gene' );
    assert && AssertUtils.assertPropertyOf( visibleProperty, 'boolean' );
    assert && assert( alignGroup instanceof AlignGroup, 'invalid alignGroup' );

    options = merge( {

      // VBox options
      align: 'left',
      spacing: 8,
      excludeInvisibleChildrenFromBounds: false,

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    const labelNode = new Text( gene.name, {
      font: NaturalSelectionConstants.CHECKBOX_FONT,
      maxWidth: 100 // determined empirically
    } );

    const checkbox = new Checkbox( visibleProperty, labelNode, merge( {}, NaturalSelectionConstants.CHECKBOX_OPTIONS, {
      tandem: options.tandem.createTandem( 'checkbox' )
    } ) );
    const xDilation = 8;
    const yDilation = 8;
    checkbox.touchArea = checkbox.localBounds.dilatedXY( xDilation, yDilation );
    checkbox.mouseArea = checkbox.localBounds.dilatedXY( xDilation, yDilation );

    // Dominant allele
    const dominantAlleleNode = new AlleleNode( gene.dominantAbbreviationTranslated, gene.normalAllele.image );

    // Recessive allele
    const recessiveAlleleNode = new AlleleNode( gene.recessiveAbbreviationTranslated, gene.mutantAllele.image );

    const alignBoxOptions = {
      group: alignGroup,
      xAlign: 'left'
    };

    // Dominant allele on the left, recessive on the right, to match 'Add Mutations' panel
    const hBox = new HBox( {
      spacing: 0,
      children: [
        new HStrut( 8 ), // indent
        new HBox( {
          spacing: 12,
          children: [
            new AlignBox( dominantAlleleNode, alignBoxOptions ),
            new AlignBox( recessiveAlleleNode, alignBoxOptions )
          ]
        } )
      ]
    } );

    assert && assert( !options.children, 'Row sets children' );
    options.children = [ checkbox, hBox ];

    super( options );

    if ( NaturalSelectionQueryParameters.allelesVisible ) {

      // unlink is not necessary.
      gene.dominantAlleleProperty.link( dominantAllele => {

        const hasMutation = !!dominantAllele;

        // Disable the checkbox when there is no mutation
        checkbox.enabled = hasMutation;

        // Don't show allele abbreviation and icon when there is no mutation
        hBox.visible = hasMutation;

        // Automatically make the alleles visible.
        // Corresponding alleles should not be visible when the row is disabled.
        // Do not do this when restoring PhET-iO state, see https://github.com/phetsims/natural-selection/issues/314.
        if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
          visibleProperty.value = hasMutation;
        }

        if ( dominantAllele ) {

          // Show the correct allele icons for dominant vs recessive
          const mutantIsDominant = ( dominantAllele === gene.mutantAllele );
          dominantAlleleNode.image = mutantIsDominant ? gene.mutantAllele.image : gene.normalAllele.image;
          recessiveAlleleNode.image = mutantIsDominant ? gene.normalAllele.image : gene.mutantAllele.image;
        }
      } );
    }

    // @public (read-only)
    this.gene = gene;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

/**
 * AlleleNode displays the abbreviation and icon for an allele.
 */
class AlleleNode extends HBox {

  /**
   * @param {string} abbreviation - the abbreviation used for the allele
   * @param {HTMLImageElement} image
   * @param {Object} [options]
   */
  constructor( abbreviation, image, options ) {

    assert && assert( typeof abbreviation === 'string', 'invalid abbreviation' );
    assert && assert( image instanceof HTMLImageElement, 'invalid image' );

    options = merge( {
      spacing: 6
    }, options );

    const textNode = new Text( abbreviation, {
      font: NaturalSelectionConstants.CHECKBOX_FONT,
      maxWidth: 12 // determined empirically
    } );

    const imageNode = new Image( image, {
      scale: 0.5 // determined empirically
    } );

    assert && assert( !options.children, 'AlleleNode sets children' );
    options.children = [ textNode, imageNode ];

    super( options );

    // @private {Image}
    this.imageNode = imageNode;
  }

  /**
   * Sets the allele image for this node.
   * @param {HTMLImageElement} value
   * @public
   */
  set image( value ) {
    assert && assert( value instanceof HTMLImageElement, 'invalid value' );
    this.imageNode.image = value;
  }
}

naturalSelection.register( 'AllelesPanel', AllelesPanel );
export default AllelesPanel;